import { useEffect, useState } from 'react'
import { categoriasApi } from '@/api/client'
import type { CategoriaResponse, CategoriaRequest } from '@/types/api'
import styles from './Categorias.module.css'

export default function Categorias() {
  const [categorias, setCategorias] = useState<CategoriaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<CategoriaResponse | null>(null)
  const [form, setForm] = useState<CategoriaRequest>({ nome: '', descricao: '' })

  const carregar = () => {
    setLoading(true)
    setErro('')
    categoriasApi.listar()
      .then(({ data }) => setCategorias(data))
      .catch(() => setErro('Erro ao carregar categorias.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  const abrirNovo = () => {
    setEditando(null)
    setForm({ nome: '', descricao: '' })
    setModalAberto(true)
  }

  const abrirEditar = (c: CategoriaResponse) => {
    setEditando(c)
    setForm({ nome: c.nome, descricao: c.descricao ?? '' })
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setEditando(null)
  }

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nome.trim()) return
    try {
      if (editando) {
        await categoriasApi.atualizar(editando.id, form)
      } else {
        await categoriasApi.criar(form)
      }
      fecharModal()
      carregar()
    } catch {
      setErro(editando ? 'Erro ao atualizar.' : 'Erro ao cadastrar.')
    }
  }

  const excluir = async (id: number) => {
    if (!window.confirm('Excluir esta categoria? Transações vinculadas podem ser afetadas.')) return
    try {
      await categoriasApi.excluir(id)
      carregar()
    } catch {
      setErro('Erro ao excluir. Pode haver transações usando esta categoria.')
    }
  }

  if (loading) return <div className={styles.loading}>Carregando...</div>

  return (
    <div className={styles.pagina}>
      <div className={styles.header}>
        <h2 className={styles.title}>Categorias</h2>
        <button type="button" onClick={abrirNovo} className={styles.btnPrimario}>
          Nova categoria
        </button>
      </div>
      {erro && <div className={styles.erro}>{erro}</div>}

      {categorias.length === 0 ? (
        <p className={styles.vazio}>Nenhuma categoria. Crie categorias para organizar suas transações (ex.: Alimentação, Transporte).</p>
      ) : (
        <ul className={styles.lista}>
          {categorias.map((c) => (
            <li key={c.id} className={styles.item}>
              <div>
                <strong>{c.nome}</strong>
                {c.descricao && <span className={styles.descricao}> — {c.descricao}</span>}
              </div>
              <div className={styles.acoes}>
                <button type="button" onClick={() => abrirEditar(c)} className={styles.btnSm}>Editar</button>
                <button type="button" onClick={() => excluir(c.id)} className={styles.btnSmDanger}>Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modalAberto && (
        <div className={styles.overlay} onClick={fecharModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>{editando ? 'Editar categoria' : 'Nova categoria'}</h3>
            <form onSubmit={salvar} className={styles.form}>
              <label className={styles.label}>
                Nome
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  required
                  maxLength={80}
                  className={styles.input}
                  placeholder="Ex: Alimentação"
                />
              </label>
              <label className={styles.label}>
                Descrição (opcional)
                <input
                  type="text"
                  value={form.descricao ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                  maxLength={200}
                  className={styles.input}
                  placeholder="Ex: Supermercado, restaurantes"
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
