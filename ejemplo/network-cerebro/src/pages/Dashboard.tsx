import { useNavigate } from 'react-router-dom'
import styles from './Dashboard.module.css'

const mockPosts = [
  {
    id: 1,
    author: 'Carlos López',
    role: 'Desarrollador Java',
    initials: 'CL',
    date: '25 jul 2026',
    category: '#Redes',
    title: 'Configuración de router Cisco ASR-920 para segmentación VLAN',
    excerpt: 'Estamos implementando segmentación de red en el nuevo datacenter y necesito validar la configuración del ASR-920...',
    tags: ['cisco', 'vlan', 'asr-920', 'segmentación'],
    responses: 5,
    votes: 12,
    status: 'resolved' as const,
  },
  {
    id: 2,
    author: 'Ana Martínez',
    role: 'Ingeniera de Sistemas',
    initials: 'AM',
    date: '24 jul 2026',
    category: '#SistemasDeCobro',
    title: 'Integración con API de facturación electrónica SAT',
    excerpt: 'Al consumir el endpoint de timbrado, obtenemos error 500 al enviar facturas con más de 50 conceptos...',
    tags: ['sat', 'facturación', 'api', 'timbrado'],
    responses: 3,
    votes: 8,
    status: 'in-progress' as const,
  },
  {
    id: 3,
    author: 'María García',
    role: 'Arquitecta de Redes',
    initials: 'MG',
    date: '23 jul 2026',
    category: '#Desarrollo',
    title: 'Librería de logging centralizado para microservicios',
    excerpt: 'Comparto un módulo reutilizable para logging estructurado con correlación de trazas entre servicios...',
    tags: ['logging', 'microservicios', 'reutilizable'],
    responses: 2,
    votes: 25,
    status: 'resolved' as const,
    isReusable: true,
    repoUrl: 'https://github.com/empresa/central-logger',
  },
]

const filterTabs = ['Todas', 'Sin resolver', 'Solucionadas', 'Módulos Reutilizables']

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div>
      <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>🔍</span>
          <input
            type="text"
            placeholder="Busca soluciones, configuraciones de router, sistemas de cobro..."
            className={styles.searchInput}
          />
        </div>
        <button className={styles.newPostBtn} onClick={() => navigate('/new-question')}>
          + Nueva Pregunta / Compartir Proyecto
        </button>
      </div>

      <div className={styles.filters}>
        {filterTabs.map((tab) => (
          <button key={tab} className={tab === 'Todas' ? styles.filterActive : styles.filterBtn}>
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.feed}>
        {mockPosts.map((post) => (
          <article
            key={post.id}
            className={styles.card}
            onClick={() => navigate(`/thread/${post.id}`)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardAuthor}>
                <div className={styles.authorAvatar}>{post.initials}</div>
                <div>
                  <div className={styles.authorName}>{post.author}</div>
                  <div className={styles.authorMeta}>
                    {post.role} · {post.date}
                  </div>
                </div>
              </div>
              <span className={styles.categoryBadge}>{post.category}</span>
            </div>

            <h3 className={styles.cardTitle}>{post.title}</h3>
            <p className={styles.cardExcerpt}>{post.excerpt}</p>

            <div className={styles.cardTags}>
              {post.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  #{tag}
                </span>
              ))}
              {post.isReusable && (
                <a
                  href={post.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.reusableBadge}
                  onClick={(e) => e.stopPropagation()}
                >
                  📦 Código/Módulo Reutilizable
                </a>
              )}
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.stat}>💬 {post.responses} respuestas</span>
              <span className={styles.stat}>👍 {post.votes} votos</span>
              <span
                className={
                  post.status === 'resolved' ? styles.statusResolved : styles.statusInProgress
                }
              >
                {post.status === 'resolved' ? '✅ Resuelto' : '⏳ En Proceso'}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}