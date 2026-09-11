// =====================================================================
// components/EditQuestionForm.tsx
// ---------------------------------------------------------------------
// Modal de "Editar pregunta" desde Mis Preguntas: precarga los datos
// actuales (GET /questions/:id) y los envía con PUT /questions/:id.
// =====================================================================
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import Icon from './Icon'

interface EditQuestionFormProps {
  questionId: number
  onClose: () => void
  onSaved: () => void
}

export default function EditQuestionForm({ questionId, onClose, onSaved }: EditQuestionFormProps) {
  const { data: question, isLoading } = useQuery({
    queryKey: ['question', questionId],
    queryFn: () => api.question(questionId),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: api.categories,
  })

  const [initialized, setInitialized] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Precarga los valores actuales una sola vez al cargar la pregunta.
  useEffect(() => {
    if (!initialized && question) {
      setTitle(question.title)
      setCategory(question.category_slug)
      setTags((question.tags ?? []).join(', '))
      setDescription(question.body_text ?? '')
      setInitialized(true)
    }
  }, [initialized, question])

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${hasError ? 'var(--color-danger)' : 'var(--color-border)'}`,
    borderRadius: 8,
    background: 'var(--color-bg-card)',
    color: 'var(--color-text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !category || !description.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await api.updateQuestion(questionId, {
        title: title.trim(),
        body_text: description.trim(),
        category_slug: category,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar los cambios')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>Cargando pregunta...</div>
  }
  if (!question) {
    return (
      <div style={{ color: 'var(--color-danger)', padding: '12px 0' }}>
        No se pudo cargar la pregunta para editar.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
          Título *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle(!title.trim())}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
          Categoría *
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={inputStyle(!category)}
        >
          <option value="">Selecciona una categoría...</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
          Etiquetas / Tags
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Ej: oracle, react, redes (separadas por coma)"
          style={inputStyle(false)}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
          Detalle de la pregunta *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          style={{ ...inputStyle(!description.trim()), resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem' }}>{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '10px 20px', borderRadius: 8, border: '1px solid var(--color-border)',
            background: 'transparent', color: 'var(--color-text-secondary)',
            fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting || !title.trim() || !category || !description.trim()}
          style={{
            padding: '10px 20px', borderRadius: 8, border: 'none',
            background: submitting ? 'var(--color-text-muted)' : 'var(--color-accent)',
            color: 'white', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}
        >
          {submitting ? 'Guardando...' : (
            <>
              <Icon name="send" size={16} /> Guardar cambios
            </>
          )}
        </button>
      </div>
    </form>
  )
}