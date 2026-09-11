// =====================================================================
// pages/Dashboard.tsx
// ---------------------------------------------------------------------
// Pantalla "Inicio / Feed": lista de preguntas que llegan de Oracle vía
// el endpoint GET /api/questions. Incluye:
//   - Tabs: Todas, Sin resolver, Más votadas, Recientes
//   - Filtro por categoría vía URL (?category=slug) desde Categorías
//   - Tarjetas con votos, respuestas, guardar y badges de estado
// =====================================================================
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type Question } from '../api/client'
import AttachmentList from '../components/AttachmentList'
import Icon from '../components/Icon'
import styles from './Dashboard.module.css'

const filterTabs = ['Todas', 'Sin resolver', 'Más votadas', 'Recientes']

// Convierte un color hex (#RRGGBB) a rgba para los badges de categoría.
function hexA(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Devuelve etiqueta + clase CSS según el estado de la pregunta.
function statusInfo(status: Question['status']) {
  switch (status) {
    case 'resolved':
      return { label: 'Resuelta', className: styles.statusResolved }
    case 'in_progress':
      return { label: 'En proceso', className: styles.statusInProgress }
    default:
      return { label: 'Sin resolver', className: styles.statusOpen }
  }
}

// "Hace 3 días" a partir de un timestamp ISO.
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'hace un momento'
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `hace ${days} d`
  return `hace ${Math.floor(days / 30)} mes${days >= 60 ? 'es' : ''}`
}

// Extracto de 2 líneas a partir del cuerpo de la pregunta.
function excerpt(body: string, max = 160) {
  const plain = body.replace(/```[\s\S]*?```/g, ' ').replace(/\s+/g, ' ').trim()
  return plain.length > max ? `${plain.slice(0, max)}...` : plain
}

export default function Dashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState('Todas')

  // Categoría seleccionada (viene de la URL, p.ej. /?category=redes).
  const categorySlug = searchParams.get('category') || ''

  // Parámetros que se mandan a GET /api/questions.
  const params: Record<string, string> = { sort: 'recent' }
  if (categorySlug) params.category = categorySlug
  if (tab === 'Sin resolver') params.status = 'open'
  if (tab === 'Más votadas') params.sort = 'votes'
  if (tab === 'Recientes') params.sort = 'recent'

  const { data: questions = [], isLoading, isError } = useQuery({
    queryKey: ['questions', { tab, categorySlug }],
    queryFn: () => api.questions(params),
  })

  // Likes y guardados del usuario actual -> el estado persiste al recargar.
  const { data: interactions } = useQuery({
    queryKey: ['me-interactions'],
    queryFn: api.interactions,
  })
  const votedIds = new Set(interactions?.voted ?? [])
  const savedIds = new Set(interactions?.saved ?? [])
  const [voteToggles, setVoteToggles] = useState<Record<number, boolean>>({})
  const [saveToggles, setSaveToggles] = useState<Record<number, boolean>>({})

  const isLiked = (id: number) => voteToggles[id] ?? votedIds.has(id)
  const isSaved = (id: number) => saveToggles[id] ?? savedIds.has(id)

  // Votar y refrescar contador + interacciones desde la BD.
  const handleVote = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    try {
      const res = await api.vote(id)
      setVoteToggles((prev) => ({ ...prev, [id]: res.voted }))
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      queryClient.invalidateQueries({ queryKey: ['me-interactions'] })
    } catch {
      // error silencioso por ahora
    }
  }

  // Guardar/quitar de "Mis Preguntas".
  const handleSave = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    try {
      const res = await api.save(id)
      setSaveToggles((prev) => ({ ...prev, [id]: res.saved }))
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      queryClient.invalidateQueries({ queryKey: ['me-interactions'] })
      queryClient.invalidateQueries({ queryKey: ['me-questions'] })
    } catch {
      // error silencioso por ahora
    }
  }

  return (
    <div>
      {/* Tabs de filtro */}
      <div className={styles.filters}>
        {filterTabs.map((t) => (
          <button
            key={t}
            className={t === tab ? styles.filterActive : styles.filterBtn}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
        {categorySlug && (
          <button className={styles.filterActive} onClick={() => navigate('/')}>
            Categoría: {categorySlug} ✕
          </button>
        )}
      </div>

      {/* Lista de tarjetas */}
      <div className={styles.feed}>
        {isLoading && !questions.length && (
          <div className={styles.emptyState}>Cargando preguntas...</div>
        )}
        {isError && (
          <div className={styles.emptyState}>
            <Icon name="helpOutline" size={40} />
            <div className={styles.emptyStateTitle}>
              No se pudo conectar con la API
            </div>
            <p>Revisa que el backend esté corriendo en el puerto 4000 y que la BD tenga las migraciones aplicadas.</p>
          </div>
        )}

        {questions.map((post) => {
          const status = statusInfo(post.status)
          return (
            <article
              key={post.id}
              className={styles.card}
              onClick={() => navigate(`/thread/${post.id}`)}
            >
              {/* Cabecera: autor + categoría */}
              <div className={styles.cardHeader}>
                <div className={styles.cardAuthor}>
                  <div className={styles.authorAvatar}>{post.author_initials}</div>
                  <div>
                    <div className={styles.authorName}>{post.author_name}</div>
                    <div className={styles.authorMeta}>
                      {post.author_role} · {timeAgo(post.created_at)}
                    </div>
                  </div>
                </div>
                <span
                  className={styles.categoryBadge}
                  style={{
                    color: post.category_color,
                    background: hexA(post.category_color, 0.16),
                  }}
                >
                  {post.category_name}
                </span>
              </div>

              {/* Título + extracto */}
              <h3 className={styles.cardTitle}>{post.title}</h3>
              <p className={styles.cardExcerpt}>{excerpt(post.body_text ?? '')}</p>

              {/* Tags */}
              <div className={styles.cardTags}>
                {post.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Adjuntos de la pregunta (PNG/PDF/archivos) */}
              <AttachmentList attachments={post.attachments} title="Adjuntos" />

              {/* Footer: votos, respuestas, guardar, estado */}
              <div className={styles.cardFooter}>
                <button
                  className={`${styles.statBtn} ${isLiked(post.id) ? styles.statBtnActive : ''}`}
                  onClick={(e) => handleVote(e, post.id)}
                  title={isLiked(post.id) ? 'Quitar like' : 'Me gusta'}
                >
                  <Icon name="thumbUp" size={16} />
                  {post.votes_count}
                </button>
                <span className={styles.stat}>
                  <Icon name="chat" size={16} />
                  {post.answers_count} respuestas
                </span>
                <button
                  className={`${styles.statBtn} ${isSaved(post.id) ? styles.statBtnActive : ''}`}
                  onClick={(e) => handleSave(e, post.id)}
                  title={isSaved(post.id) ? 'Quitar de guardados' : 'Guardar'}
                >
                  <Icon name={isSaved(post.id) ? 'bookmark' : 'bookmarkBorder'} size={16} />
                </button>
                <span className={status.className}>{status.label}</span>
              </div>
            </article>
          )
        })}

        {!isLoading && !isError && questions.length === 0 && (
          <div className={styles.emptyState}>
            <Icon name="search" size={40} />
            <div className={styles.emptyStateTitle}>Sin resultados</div>
            <p>No hay preguntas con esos filtros. ¡Sé el primero en preguntar!</p>
          </div>
        )}
      </div>
    </div>
  )
}