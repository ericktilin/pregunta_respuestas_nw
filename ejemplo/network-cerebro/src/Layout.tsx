// =====================================================================
// Layout.tsx
// ---------------------------------------------------------------------
// Estructura global de 3 columnas según el diseño de Nextword:
//   1. Sidebar izquierdo fijo (~240px): logo + menú + perfil de usuario.
//   2. Área central: búsqueda global + botón "Hacer una pregunta" + página.
//   3. Sidebar derecho (~300px): expertos destacados + categorías.
// =====================================================================
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useThemeStore } from './stores/themeStore'
import { api } from './api/client'
import Icon, { type IconName } from './components/Icon'
import Modal from './components/Modal'
import QuestionForm from './components/QuestionForm'
import styles from './App.module.css'

interface NavItem {
  path: string
  label: string
  icon: IconName
}

const navItems: NavItem[] = [
  { path: '/', label: 'Inicio', icon: 'home' },
  { path: '/categories', label: 'Categorías Técnicas', icon: 'category' },
  { path: '/my-questions', label: 'Mis Preguntas', icon: 'bookmark' },
  { path: '/reusable-modules', label: 'Proyectos Reutilizables', icon: 'code' },
]

export default function Layout() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useThemeStore()

  // Estado del modal "Hacer una pregunta".
  const [askOpen, setAskOpen] = useState(false)
  // Estado de la búsqueda global del header.
  const [query, setQuery] = useState('')

  //  Datos del sidebar derecho y perfil (vienen de la API) 
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: api.me })
  const { data: experts = [] } = useQuery({ queryKey: ['experts'], queryFn: api.experts })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: api.categories })

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className={styles.layout}>
      {/* ---------------- Sidebar izquierdo ---------------- */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Icon name="forum" size={18} />
          </div>
          <div>
            <div className={styles.logoText}>NEXTWORD</div>
            <div className={styles.logoSub}>Foro técnico interno</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => (isActive ? styles.navItemActive : styles.navItem)}
            >
              <span className={styles.navIcon}>
                <Icon name={item.icon} size={19} />
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Perfil del usuario autenticado por la Intranet */}
        <div className={styles.userBar}>
          <div className={styles.userAvatarBig}>
            {user?.avatar_initials || 'EP'}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.full_name || 'Erick Pérez'}</div>
            <div className={styles.userRole}>{user?.role_title || 'Colaborador'}</div>
            <div className={styles.userRep}>
              <Icon name="star" size={12} />
              {user?.reputation_points ?? 0} pts de reputación
            </div>
          </div>
        </div>
      </aside>

      {/* ---------------- Área central ---------------- */}
      <div className={styles.mainArea}>
        <header className={styles.header}>
          <form className={styles.headerSearch} onSubmit={onSearch}>
            <span className={styles.searchIcon}>
              <Icon name="search" size={18} />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar preguntas, temas, proyectos..."
              className={styles.searchInput}
            />
          </form>

          <div className={styles.headerRight}>
            <button
              className={styles.askBtn}
              onClick={() => setAskOpen(true)}
            >
              <Icon name="add" size={18} />
              Hacer una pregunta
            </button>
            <button
              className={styles.themeToggle}
              onClick={toggleTheme}
              title={theme === 'light' ? 'Cambiar a oscuro' : 'Cambiar a claro'}
            >
              <Icon name={theme === 'light' ? 'darkMode' : 'lightMode'} size={18} />
            </button>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>

      {/* ---------------- Sidebar derecho ---------------- */}
      <aside className={styles.rightSidebar}>
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Expertos Destacados</h3>
          {experts.map((expert) => (
            <div key={expert.id} className={styles.expertCard}>
              <div className={styles.expertAvatar}>{expert.avatar_initials}</div>
              <div className={styles.expertInfo}>
                <div className={styles.expertName}>{expert.full_name}</div>
                <div className={styles.expertRole}>{expert.role_title}</div>
                <div className={styles.expertStat}>
                  <Icon name="checkCircle" size={12} />
                  {expert.accepted_count} respuestas aceptadas
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Categorías Populares</h3>
          {categories.map((cat) => (
            <NavLink key={cat.slug} to={`/?category=${cat.slug}`} className={styles.catRow}>
              <span
                className={styles.catDot}
                style={{ background: cat.color_code || 'var(--color-text-muted)' }}
              />
              <span className={styles.catName}>{cat.name}</span>
              <span className={styles.catCount}>{cat.questions_count}</span>
            </NavLink>
          ))}
        </div>
      </aside>

      {/* ---------------- Modal crear pregunta ---------------- */}
      <Modal open={askOpen} title="Hacer una pregunta" onClose={() => setAskOpen(false)}>
        <QuestionForm onClose={() => setAskOpen(false)} />
      </Modal>
    </div>
  )
}