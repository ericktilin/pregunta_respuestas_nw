// =====================================================================
// pages/MyQuestions.tsx
// ---------------------------------------------------------------------
// Pantalla "Mis Preguntas" — dashboard personal:
//   1. 4 tarjetas de métricas (Totales, Resueltas, En proceso, Guardadas)
//   2. Filtros por pestaña (Todas / Sin resolver / En proceso / Resueltas / Guardadas)
//   3. Lista de preguntas propias con acciones (editar/eliminar)
//   4. Panel lateral con historial de actividad reciente
// =====================================================================
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type Question } from '../api/client'
import Icon, { type IconName } from '../components/Icon'
import Modal from '../components/Modal'
import EditQuestionForm from '../components/EditQuestionForm'
import styles from './MyQuestions.module.css'

const tabs = ['Todas', 'Sin resolver', 'En proceso', 'Resueltas', 'Guardadas']

const STATUS_TO_TAB: Record<string, Question['status']> = {
  'Sin resolver': 'open',
  'En proceso': 'in_progress',
  Resueltas: 'resolved',
}

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

function StatusBadge({ status }: { status: Question['status'] }) {
  const map = {
    resolved: { label: 'Resuelta', className: 'statusResolved' },
    in_progress: { label: 'En proceso', className: 'statusInProgress' },
    open: { label: 'Sin resolver', className: 'statusOpen' },
  }[status]
  return <span className={styles[map.className]}>{map.label}</span>
}

function hexA(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function MyQuestions() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('Todas')
  const [editingId, setEditingId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['me-questions'],
    queryFn: api.myQuestions,
  })

  const { data: activity = [] } = useQuery({
    queryKey: ['me-activity'],
    queryFn: api.myActivity,
  })

  const metrics = data?.metrics

  // Elimina en el backend (DELETE /questions/:id) y refresca las listas.
  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta pregunta?')) return
    try {
      await api.deleteQuestion(id)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['me-questions'] }),
        queryClient.invalidateQueries({ queryKey: ['me-activity'] }),
        queryClient.invalidateQueries({ queryKey: ['questions'] }),
        queryClient.invalidateQueries({ queryKey: ['me-interactions'] }),
      ])
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'No se pudo eliminar')
    }
  }

  // Tras guardar los cambios del modal, refresca todo lo relacionado.
  const handleEdited = () => {
    setEditingId(null)
    queryClient.invalidateQueries({ queryKey: ['me-questions'] })
    queryClient.invalidateQueries({ queryKey: ['questions'] })
    queryClient.invalidateQueries({ queryKey: ['me-activity'] })
  }

  // Lista visible según la pestaña activada.
  const list: Question[] = (() => {
    if (!data) return []
    if (tab === 'Guardadas') return data.savedQuestions
    if (tab === 'Todas') return data.questions
    const status = STATUS_TO_TAB[tab]
    return data.questions.filter((q) => q.status === status)
  })()

  const metricCards = [
    { label: 'Totales', value: metrics?.total ?? 0, icon: 'forum' as IconName, color: 'var(--color-accent)' },
    { label: 'Resueltas', value: metrics?.resolved ?? 0, icon: 'checkCircle' as IconName, color: 'var(--color-success)' },
    { label: 'En proceso', value: metrics?.in_progress ?? 0, icon: 'schedule' as IconName, color: 'var(--color-warning)' },
    { label: 'Guardadas', value: metrics?.saved ?? 0, icon: 'bookmark' as IconName, color: 'var(--color-text-secondary)' },
  ]

  return (
    <div>
      <h1 className={styles.title}>Mis Preguntas</h1>
      <p className={styles.subtitle}>Tus publicaciones, métricas y actividad reciente.</p>

      {/* 4 tarjetas de métricas superiores */}
      <div className={styles.metrics}>
        {metricCards.map((m) => (
          <div key={m.label} className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ color: m.color }}>
              <Icon name={m.icon} size={20} />
            </div>
            <div>
              <div className={styles.metricValue}>{m.value}</div>
              <div className={styles.metricLabel}>{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.body}>
        {/* Columna izquierda: filtros + lista */}
        <div className={styles.listColumn}>
          <div className={styles.tabs}>
            {tabs.map((t) => (
              <button
                key={t}
                className={t === tab ? styles.tabActive : styles.tab}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {isLoading && <div className={styles.emptyState}>Cargando...</div>}

          <div className={styles.rows}>
            {list.map((q) => (
              <div
                key={q.id}
                className={styles.row}
                onClick={() => navigate(`/thread/${q.id}`)}
              >
                <div className={styles.rowTitle}>{q.title}</div>
                <div className={styles.rowMeta}>
                  <span
                    className={styles.categoryPill}
                    style={{ color: q.category_color, background: hexA(q.category_color, 0.16) }}
                  >
                    {q.category_name}
                  </span>
                  <span className={styles.rowStat}>
                    <Icon name="thumbUp" size={13} /> {q.votes_count}
                  </span>
                  <span className={styles.rowStat}>
                    <Icon name="chat" size={13} /> {q.answers_count}
                  </span>
                  <span className={styles.rowStat}>{timeAgo(q.created_at)}</span>
                </div>
                <div className={styles.rowFooter}>
                  <StatusBadge status={q.status} />
                  <div className={styles.rowActions}>
                    <button
                      className={styles.actionBtn}
                      title="Editar"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingId(q.id)
                      }}
                    >
                      <Icon name="edit" size={15} />
                    </button>
                    <button
                      className={styles.actionBtn}
                      title="Eliminar"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(q.id)
                      }}
                    >
                      <Icon name="delete" size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!isLoading && list.length === 0 && (
              <div className={styles.emptyState}>
                <Icon name="bookmarkBorder" size={36} />
                <p>No hay publicaciones en esta sección.</p>
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha: histial de actividad reciente */}
        <aside className={styles.activityPanel}>
          <h3 className={styles.activityTitle}>Historial de Actividad</h3>
          {activity.length === 0 && (
            <p className={styles.activityEmpty}>Aún no tienes actividad.</p>
          )}
          {activity.map((a, i) => (
            <button
              key={`${a.type}-${a.ref_id}-${i}`}
              className={styles.activityItem}
              onClick={() => navigate(`/thread/${a.ref_id}`)}
            >
              <span className={styles.activityIcon}>
                <Icon name={a.type === 'pregunta' ? 'forum' : 'chat'} size={15} />
              </span>
              <span className={styles.activityText}>{a.text}</span>
              <span className={styles.activityTime}>{timeAgo(a.created_at)}</span>
            </button>
          ))}
        </aside>
      </div>

      {/* Modal de edición de pregunta */}
      <Modal
        open={editingId !== null}
        title="Editar pregunta"
        onClose={() => setEditingId(null)}
        wide
      >
        {editingId !== null && (
          <EditQuestionForm
            questionId={editingId}
            onClose={() => setEditingId(null)}
            onSaved={handleEdited}
          />
        )}
      </Modal>
    </div>
  )
}