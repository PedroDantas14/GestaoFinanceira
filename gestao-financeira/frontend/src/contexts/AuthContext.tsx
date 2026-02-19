import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { LoginResponse } from '@/types/api'
import { authApi } from '@/api/client'

const STORAGE_TOKEN = 'token'
const STORAGE_USER = 'user'

interface User {
  usuarioId: number
  email: string
  nome: string
}

interface AuthContextType {
  token: string | null
  user: User | null
  loading: boolean
  login: (email: string, senha: string) => Promise<void>
  registrar: (nome: string, email: string, senha: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_TOKEN))
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(STORAGE_USER)
    return raw ? (JSON.parse(raw) as User) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, senha: string) => {
    const { data } = await authApi.login(email, senha)
    persistAuth(data)
  }, [])

  const registrar = useCallback(async (nome: string, email: string, senha: string) => {
    const { data } = await authApi.registrar(nome, email, senha)
    persistAuth(data)
  }, [])

  function persistAuth(data: LoginResponse) {
    const u: User = { usuarioId: data.usuarioId, email: data.email, nome: data.nome }
    setToken(data.token)
    setUser(u)
    localStorage.setItem(STORAGE_TOKEN, data.token)
    localStorage.setItem(STORAGE_USER, JSON.stringify(u))
  }

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_TOKEN)
    localStorage.removeItem(STORAGE_USER)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, loading, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
