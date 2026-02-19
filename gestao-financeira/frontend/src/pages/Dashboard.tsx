import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { relatoriosApi } from '@/api/client'
import type { RelatorioMensalResponse, ResumoPorCategoria } from '@/types/api'
import styles from './Dashboard.module.css'

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const CORES_CATEGORIAS = [
  '#1d9bf0', '#00ba7c', '#f4212e', '#ffad1f', '#7856ff', '#00c7b7', '#8b98a5', '#7c3aed',
]

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

function dadosGraficoBarras(r: RelatorioMensalResponse) {
  return [
    { nome: 'Entradas', valor: r.totalEntradas, fill: '#00ba7c' },
    { nome: 'Saídas', valor: r.totalSaidas, fill: '#f4212e' },
  ]
}

function dadosGraficoPie(porCategoria: ResumoPorCategoria[], tipo: 'ENTRADA' | 'SAIDA') {
  return porCategoria
    .filter((item) => item.tipo === tipo)
    .map((item, i) => ({
      name: item.categoriaNome,
      value: item.total,
      fill: CORES_CATEGORIAS[i % CORES_CATEGORIAS.length],
    }))
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

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Carregando dashboard...</p>
        </div>
      </div>
    )
  }
  if (erro) return <div className={styles.erro}>{erro}</div>

  const r = relatorio!
  const saldoPositivo = r.saldo >= 0
  const barras = dadosGraficoBarras(r)
  const pieSaidas = r.porCategoria?.length ? dadosGraficoPie(r.porCategoria, 'SAIDA') : []
  const pieEntradas = r.porCategoria?.length ? dadosGraficoPie(r.porCategoria, 'ENTRADA') : []
  const temDadosGrafico = pieSaidas.length > 0 || pieEntradas.length > 0

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.subtitle}>Resumo de {MESES[mes - 1]} de {ano}</p>
        </div>
      </header>

      {/* KPIs */}
      <section className={styles.kpis}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiIcon} aria-hidden>↑</span>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Entradas do mês</span>
            <span className={styles.kpiValorEntrada}>{formatarMoeda(r.totalEntradas)}</span>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiIcon} aria-hidden>↓</span>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Saídas do mês</span>
            <span className={styles.kpiValorSaida}>{formatarMoeda(r.totalSaidas)}</span>
          </div>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiCardSaldo} ${saldoPositivo ? styles.saldoPos : styles.saldoNeg}`}>
          <span className={styles.kpiIcon} aria-hidden>≡</span>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Saldo</span>
            <span className={styles.kpiValor}>{formatarMoeda(r.saldo)}</span>
          </div>
        </div>
      </section>

      {/* Gráficos */}
      <section className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Entradas x Saídas</h3>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barras} margin={{ top: 12, right: 12, left: 12, bottom: 8 }}>
                <XAxis dataKey="nome" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => formatarMoeda(v)} />
                <Tooltip
                  formatter={(value: number) => [formatarMoeda(value), 'Valor']}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--text)' }}
                />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {temDadosGrafico && (
          <>
            {pieSaidas.length > 0 && (
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Saídas por categoria</h3>
                <div className={styles.chartWrap}>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={pieSaidas}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: 'var(--border)' }}
                      >
                        {pieSaidas.map((_, i) => (
                          <Cell key={i} fill={pieSaidas[i].fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatarMoeda(value)}
                        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            {pieEntradas.length > 0 && (
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Entradas por categoria</h3>
                <div className={styles.chartWrap}>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={pieEntradas}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: 'var(--border)' }}
                      >
                        {pieEntradas.map((_, i) => (
                          <Cell key={i} fill={pieEntradas[i].fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatarMoeda(value)}
                        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Tabela por categoria (resumo) */}
      {r.porCategoria && r.porCategoria.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Resumo por categoria</h3>
          <div className={styles.listaCard}>
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
          </div>
        </section>
      )}

      {/* Últimas transações */}
      {r.transacoes && r.transacoes.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Últimas transações</h3>
          <div className={styles.tabelaCard}>
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
          </div>
        </section>
      )}

      {(!r.transacoes || r.transacoes.length === 0) && (!r.porCategoria || r.porCategoria.length === 0) && (
        <div className={styles.vazioCard}>
          <p className={styles.vazio}>
            Nenhuma transação neste mês. Cadastre <strong>Categorias</strong> e depois <strong>Transações</strong> para ver o dashboard completo.
          </p>
        </div>
      )}
    </div>
  )
}
