import { useEffect, useState } from 'react'
import { transacoesApi } from '@/api/client'
import { categoriasApi } from '@/api/client'
import type { TransacaoResponse, CategoriaResponse, TransacaoRequest, TipoTransacao } from '@/types/api'
import styles from './Transacoes.module.css'

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

function hojeISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function Transacoes() {
  const [transacoes, setTransacoes] = useState<TransacaoResponse[]>([])
  const [categorias, setCategorias] = useState<CategoriaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<TransacaoResponse | null>(null)
  const [form, setForm] = useState<TransacaoRequest>({
    data: hojeISO(),
    valor: 0,
    tipo: 'SAIDA',
    descricao: '',
    categoriaId: 0,
  })

  const carregar = () => {
    setLoading(true)
    setErro('')
    Promise.all([transacoesApi.listar(), categoriasApi.listar()])
      .then(([tRes, cRes]) => {
        setTransacoes(tRes.data)
        setCategorias(cRes.data)
        if (cRes.data.length > 0 && form.categoriaId === 0) {
          setForm((f) => ({ ...f, categoriaId: cRes.data[0].id }))
        }
      })
      .catch(() => setErro('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  const abrirNovo = () => {
    setEditando(null)
    setForm({ data: hojeISO(), valor: 0, tipo: 'SAIDA', descricao: '', categoriaId: categorias[0]?.id ?? 0 })
    setModalAberto(true)
  }

  const abrirEditar = (t: TransacaoResponse) => {
    setEditando(t)
    setForm({
      data: t.data,
      valor: t.valor,
      tipo: t.tipo,
      descricao: t.descricao ?? '',
      categoriaId: t.categoriaId,
    })
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setEditando(null)
  }

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.categoriaId === 0 || form.valor <= 0) return
    try {
      if (editando) {
        await transacoesApi.atualizar(editando.id, form)
      } else {
        await transacoesApi.criar(form)
      }
      fecharModal()
      carregar()
    } catch {
      setErro(editando ? 'Erro ao atualizar.' : 'Erro ao cadastrar.')
    }
  }

  const excluir = async (id: number) => {
    if (!window.confirm('Excluir esta transação?')) return
    try {
      await transacoesApi.excluir(id)
      carregar()
    } catch {
      setErro('Erro ao excluir.')
    }
  }

  if (loading) return <div className={styles.loading}>Carregando...</div>

  return (
    <div className={styles.pagina}>
      <div className={styles.header}>
        <h2 className={styles.title}>Transações</h2>
        <button type="button" onClick={abrirNovo} className={styles.btnPrimario}>
          Nova transação
        </button>
      </div>
      {erro && <div className={styles.erro}>{erro}</div>}

      {transacoes.length === 0 ? (
        <p className={styles.vazio}>Nenhuma transação. Cadastre categorias e depois adicione transações.</p>
      ) : (
        <div className={styles.tabelaWrap}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th className={styles.thNum}>Valor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transacoes.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.data).toLocaleDateString('pt-BR')}</td>
                  <td>{t.descricao || '—'}</td>
                  <td>{t.categoriaNome}</td>
                  <td>
                    <span className={t.tipo === 'ENTRADA' ? styles.badgeEntrada : styles.badgeSaida}>
                      {t.tipo}
                    </span>
                  </td>
                  <td className={t.tipo === 'ENTRADA' ? styles.valorEntrada : styles.valorSaida}>
                    {t.tipo === 'ENTRADA' ? '+' : '-'} {formatarMoeda(t.valor)}
                  </td>
                  <td>
                    <button type="button" onClick={() => abrirEditar(t)} className={styles.btnSm}>Editar</button>
                    <button type="button" onClick={() => excluir(t.id)} className={styles.btnSmDanger}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAberto && (
        <div className={styles.overlay} onClick={fecharModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>{editando ? 'Editar transação' : 'Nova transação'}</h3>
            <form onSubmit={salvar} className={styles.form}>
              <label className={styles.label}>
                Data
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                  required
                  className={styles.input}
                />
              </label>
              <label className={styles.label}>
                Tipo
                <select
                  value={form.tipo}
                  onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TipoTransacao }))}
                  className={styles.input}
                >
                  <option value="ENTRADA">Entrada</option>
                  <option value="SAIDA">Saída</option>
                </select>
              </label>
              <label className={styles.label}>
                Categoria
                <select
                  value={form.categoriaId}
                  onChange={(e) => setForm((f) => ({ ...f, categoriaId: Number(e.target.value) }))}
                  required
                  className={styles.input}
                >
                  <option value={0}>Selecione</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </label>
              <label className={styles.label}>
                Valor
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.valor || ''}
                  onChange={(e) => setForm((f) => ({ ...f, valor: parseFloat(e.target.value) || 0 }))}
                  required
                  className={styles.input}
                  placeholder="0,00"
                />
              </label>
              <label className={styles.label}>
                Descrição
                <input
                  type="text"
                  value={form.descricao}
                  onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                  className={styles.input}
                  placeholder="Opcional"
                />
              </label>
              <div className={styles.formActions}>
                <button type="button" onClick={fecharModal} className={styles.btnSecundario}>Cancelar</button>
                <button type="submit" className={styles.btnPrimario}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
