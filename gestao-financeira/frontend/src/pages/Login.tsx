import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import styles from './Auth.module.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await login(email, senha)
      navigate('/')
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Falha no login. Verifique e-mail e senha.'
      setErro(msg ?? 'Falha no login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Entrar</h1>
        <p className={styles.subtitle}>Acesse sua conta para gerenciar suas finanças.</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          {erro && <div className={styles.erro} role="alert">{erro}</div>}
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
            Senha
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
              className={styles.input}
              placeholder="••••••••"
            />
          </label>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className={styles.footer}>
          Não tem conta? <Link to="/registrar">Cadastre-se</Link>
        </p>
      </div>
    </div>
  )
}
