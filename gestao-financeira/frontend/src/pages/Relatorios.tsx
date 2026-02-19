import { useEffect, useState } from 'react'
import { relatoriosApi } from '@/api/client'
import type { RelatorioMensalResponse } from '@/types/api'
import styles from './Relatorios.module.css'

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

const anoAtual = new Date().getFullYear()
const anos = Array.from({ length: 5 }, (_, i) => anoAtual - 2 + i)
const mesAtual = new Date().getMonth() + 1

export default function Relatorios() {
  const [ano, setAno] = useState(anoAtual)
  const [mes, setMes] = useState(mesAtual)
  const [relatorio, setRelatorio] = useState<RelatorioMensalResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [exportando, setExportando] = useState<'pdf' | 'excel' | null>(null)

  const carregar = () => {
    setLoading(true)
    setErro('')
    relatoriosApi.mensal(ano, mes)
      .then(({ data }) => setRelatorio(data))
      .catch(() => setErro('Erro ao carregar relatório.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [ano, mes])

  const baixarArquivo = (blob: Blob, nome: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nome
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportarPdf = async () => {
    setExportando('pdf')
    try {
      const { data } = await relatoriosApi.exportPdf(ano, mes)
      baixarArquivo(data, `relatorio_${ano}_${mes}.pdf`)
    } catch {
      setErro('Erro ao gerar PDF.')
    } finally {
      setExportando(null)
    }
  }

  const exportarExcel = async () => {
    setExportando('excel')
    try {
      const { data } = await relatoriosApi.exportExcel(ano, mes)
      baixarArquivo(data, `relatorio_${ano}_${mes}.xlsx`)
    } catch {
      setErro('Erro ao gerar Excel.')
    } finally {
      setExportando(null)
    }
  }

  return (
    <div className={styles.pagina}>
      <h2 className={styles.title}>Relatórios</h2>
      <p className={styles.subtitle}>Consulte o resumo mensal e exporte em PDF ou Excel.</p>

      <div className={styles.filtros}>
        <label className={styles.label}>
          Ano
          <select value={ano} onChange={(e) => setAno(Number(e.target.value))} className={styles.select}>
            {anos.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>
        <label className={styles.label}>
          Mês
          <select value={mes} onChange={(e) => setMes(Number(e.target.value))} className={styles.select}>
            {MESES.map((nome, i) => (
              <option key={i} value={i + 1}>{nome}</option>
            ))}
          </select>
        </label>
        <div className={styles.exportBtns}>
          <button
            type="button"
            onClick={exportarPdf}
            disabled={!!exportando || loading}
            className={styles.btnExport}
          >
            {exportando === 'pdf' ? 'Gerando...' : 'Exportar PDF'}
          </button>
          <button
            type="button"
            onClick={exportarExcel}
            disabled={!!exportando || loading}
            className={styles.btnExport}
          >
            {exportando === 'excel' ? 'Gerando...' : 'Exportar Excel'}
          </button>
        </div>
      </div>

      {erro && <div className={styles.erro}>{erro}</div>}

      {loading ? (
        <div className={styles.loading}>Carregando relatório...</div>
      ) : relatorio ? (
        <div className={styles.conteudo}>
          <div className={styles.cards}>
            <div className={styles.card}>
              <span className={styles.cardLabel}>Entradas</span>
              <span className={styles.cardValorEntrada}>{formatarMoeda(relatorio.totalEntradas)}</span>
            </div>
            <div className={styles.card}>
              <span className={styles.cardLabel}>Saídas</span>
              <span className={styles.cardValorSaida}>{formatarMoeda(relatorio.totalSaidas)}</span>
            </div>
            <div className={`${styles.card} ${relatorio.saldo >= 0 ? styles.cardSaldoPos : styles.cardSaldoNeg}`}>
              <span className={styles.cardLabel}>Saldo</span>
              <span className={styles.cardValor}>{formatarMoeda(relatorio.saldo)}</span>
            </div>
          </div>

          {relatorio.porCategoria && relatorio.porCategoria.length > 0 && (
            <section className={styles.section}>
              <h3>Resumo por categoria</h3>
              <ul className={styles.listaCat}>
                {relatorio.porCategoria.map((item) => (
                  <li key={`${item.categoriaId}-${item.tipo}`} className={styles.itemCat}>
                    <span>{item.categoriaNome}</span>
                    <span className={item.tipo === 'ENTRADA' ? styles.valorEntrada : styles.valorSaida}>
                      {item.tipo === 'ENTRADA' ? '+' : '-'} {formatarMoeda(item.total)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {relatorio.transacoes && relatorio.transacoes.length > 0 && (
            <section className={styles.section}>
              <h3>Transações do mês</h3>
              <div className={styles.tabelaWrap}>
                <table className={styles.tabela}>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Descrição</th>
                      <th>Categoria</th>
                      <th>Tipo</th>
                      <th className={styles.thNum}>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.transacoes.map((t) => (
                      <tr key={t.id}>
                        <td>{new Date(t.data).toLocaleDateString('pt-BR')}</td>
                        <td>{t.descricao || '—'}</td>
                        <td>{t.categoriaNome}</td>
                        <td>{t.tipo}</td>
                        <td className={t.tipo === 'ENTRADA' ? styles.valorEntrada : styles.valorSaida}>
                          {t.tipo === 'ENTRADA' ? '+' : '-'} {formatarMoeda(t.valor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {(!relatorio.transacoes || relatorio.transacoes.length === 0) && (
            <p className={styles.vazio}>Nenhuma transação em {MESES[mes - 1]} de {ano}.</p>
          )}
        </div>
      ) : null}
    </div>
  )
}
