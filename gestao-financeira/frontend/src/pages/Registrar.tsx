import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import styles from './Auth.module.css'

export default function Registrar() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const { registrar } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    setLoading(true)
    try {
      await registrar(nome, email, senha)
      navigate('/')
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Falha no cadastro. Tente outro e-mail.'
      setErro(msg ?? 'Falha no cadastro.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Cadastrar</h1>
        <p className={styles.subtitle}>Crie sua conta para começar a controlar suas finanças.</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          {erro && <div className={styles.erro} role="alert">{erro}</div>}
          <label className={styles.label}>
            Nome
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              className={styles.input}
              placeholder="Seu nome"
            />
          </label>
          <label className={styles.label}>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={styles.input}
              placeholder="seu@email.com"
            />
          </label>
          <label className={styles.label}>
            Senha (mín. 6 caracteres)
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className={styles.input}
              placeholder="••••••••"
            />
          </label>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
        <p className={styles.footer}>
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
