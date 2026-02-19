import { useEffect, useState } from 'react'
import { relatoriosApi } from '@/api/client'
import type { RelatorioMensalResponse } from '@/types/api'
import styles from './Dashboard.module.css'

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

export default function Dashboard() {
  const [relatorio, setRelatorio] = useState<RelatorioMensalResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth() + 1

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setErro('')
    relatoriosApi.mensal(ano, mes)
      .then(({ data }) => { if (!cancelled) setRelatorio(data) })
      .catch(() => { if (!cancelled) setErro('Não foi possível carregar o resumo do mês.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [ano, mes])

  if (loading) return <div className={styles.loading}>Carregando dashboard...</div>
  if (erro) return <div className={styles.erro}>{erro}</div>

  const r = relatorio!
  const saldoPositivo = r.saldo >= 0

  return (
    <div className={styles.dashboard}>
      <h2 className={styles.pageTitle}>Dashboard</h2>
      <p className={styles.subtitle}>Resumo de {MESES[mes - 1]} de {ano}</p>

      <div className={styles.cards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Total de entradas</span>
          <span className={styles.cardValorEntrada}>{formatarMoeda(r.totalEntradas)}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Total de saídas</span>
          <span className={styles.cardValorSaida}>{formatarMoeda(r.totalSaidas)}</span>
        </div>
        <div className={`${styles.card} ${saldoPositivo ? styles.cardSaldoPos : styles.cardSaldoNeg}`}>
          <span className={styles.cardLabel}>Saldo do mês</span>
          <span className={styles.cardValor}>{formatarMoeda(r.saldo)}</span>
        </div>
      </div>

      {r.porCategoria && r.porCategoria.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Por categoria</h3>
          <ul className={styles.listaCategorias}>
            {r.porCategoria.map((item) => (
              <li key={`${item.categoriaId}-${item.tipo}`} className={styles.itemCategoria}>
                <span className={styles.catNome}>{item.categoriaNome}</span>
                <span className={item.tipo === 'ENTRADA' ? styles.catEntrada : styles.catSaida}>
                  {item.tipo === 'ENTRADA' ? '+' : '-'} {formatarMoeda(item.total)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {r.transacoes && r.transacoes.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Últimas transações do mês</h3>
          <div className={styles.tabelaWrap}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th className={styles.thNum}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {r.transacoes.slice(0, 10).map((t) => (
                  <tr key={t.id}>
                    <td>{new Date(t.data).toLocaleDateString('pt-BR')}</td>
                    <td>{t.descricao || '—'}</td>
                    <td>{t.categoriaNome}</td>
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

      {(!r.transacoes || r.transacoes.length === 0) && (!r.porCategoria || r.porCategoria.length === 0) && (
        <p className={styles.vazio}>Nenhuma transação neste mês. Cadastre em <strong>Transações</strong> e defina <strong>Categorias</strong>.</p>
      )}
    </div>
  )
}
