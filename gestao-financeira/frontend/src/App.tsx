import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Registrar from '@/pages/Registrar'
import Dashboard from '@/pages/Dashboard'
import Transacoes from '@/pages/Transacoes'
import Categorias from '@/pages/Categorias'
import Relatorios from '@/pages/Relatorios'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth()
  if (loading) return <div className="app-loading">Carregando...</div>
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth()
  if (loading) return <div className="app-loading">Carregando...</div>
  if (token) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/registrar" element={<PublicOnlyRoute><Registrar /></PublicOnlyRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="transacoes" element={<Transacoes />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="relatorios" element={<Relatorios />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
