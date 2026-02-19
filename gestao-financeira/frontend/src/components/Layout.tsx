import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import styles from './Layout.module.css'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/transacoes', label: 'Transações', end: false },
  { to: '/categorias', label: 'Categorias', end: false },
  { to: '/relatorios', label: 'Relatórios', end: false },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.logo}>Gestão Financeira</h1>
          <nav className={styles.nav} aria-label="Principal">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink)}
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className={styles.user}>
            <span className={styles.userName}>{user?.nome ?? user?.email}</span>
            <button type="button" onClick={handleLogout} className={styles.btnLogout}>
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
