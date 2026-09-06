import { NavLink, Outlet } from 'react-router-dom'
import { useThemeStore } from './stores/themeStore'
import styles from './App.module.css'

const navItems = [
  { path: '/', label: 'Inicio', icon: '🏠' },
  { path: '/categories', label: 'Categorías Técnicas', icon: '📂' },
  { path: '/my-questions', label: 'Mis Preguntas', icon: '✋' },
  { path: '/knowledge-base', label: 'Base de Conocimiento', icon: '📚' },
  { path: '/reusable-modules', label: 'Proyectos Reutilizables', icon: '📦' },
]

const experts = [
  { name: 'María García', role: 'Arquitecta de Redes', initials: 'MG' },
  { name: 'Carlos López', role: 'Desarrollador Java', initials: 'CL' },
  { name: 'Ana Martínez', role: 'Ingeniera de Sistemas', initials: 'AM' },
]

export default function Layout() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🧠</div>
          <span className={styles.logoText}>Network Cerebro</span>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                isActive ? styles.navItemActive : styles.navItem
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={styles.mainArea}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              Foro Técnico Interno
            </span>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.themeToggle} onClick={toggleTheme}>
              {theme === 'light' ? '🌙' : '☀️'}
              {theme === 'light' ? ' Oscuro' : ' Claro'}
            </button>
            <div className={styles.userAvatar}>EK</div>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>

      <aside className={styles.rightSidebar}>
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Expertos Destacados</h3>
          {experts.map((expert) => (
            <div key={expert.name} className={styles.expertCard}>
              <div className={styles.expertAvatar}>{expert.initials}</div>
              <div className={styles.expertInfo}>
                <div className={styles.expertName}>{expert.name}</div>
                <div className={styles.expertRole}>{expert.role}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Accesos Rápidos</h3>
          <a href="#" className={styles.quickAccessLink}>
            🎫 Abrir ticket en Assis Now
          </a>
          <a href="#" className={styles.quickAccessLink}>
            📋 Mis tickets recientes
          </a>
        </div>
      </aside>
    </div>
  )
}