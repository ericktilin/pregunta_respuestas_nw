// =====================================================================
// components/QuestionForm.tsx
// ---------------------------------------------------------------------
// Formulario del modal "Hacer una pregunta":
//   título, categoría, etiquetas, detalle y adjuntos.
// Al publicar guarda en Oracle vía POST /api/questions y luego navega
// al detalle de la pregunta creada.
// =====================================================================
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import Icon from './Icon'

interface QuestionFormProps {
  onClose: () => void
}

export default function QuestionForm({ onClose }: QuestionFormProps) {
  const navigate = useNavigate()

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: api.categories,
  })

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [description, setDescription] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'El título es obligatorio'
    else if (title.trim().length < 10) errs.title = 'El título debe tener al menos 10 caracteres'
    if (!category) errs.category = 'Elige una categoría'
    if (!description.trim()) errs.description = 'El detalle es obligatorio'
    else if (description.trim().length < 20) errs.description = 'Describe tu pregunta con más detalle (mín. 20 caracteres)'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setError('')
    try {
      const { id } = await api.createQuestion(
        {
          title: title.trim(),
          body_text: description.trim(),
          category_slug: category,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        },
        attachments,
      )
      onClose()
      navigate(`/thread/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo publicar la pregunta')
    } finally {
      setSubmitting(false)
    }
  }

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
          placeholder="Ej: Configuración de router Cisco ASR-920 para segmentación VLAN"
          style={inputStyle(Boolean(errors.title))}
        />
        {errors.title && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: 4, display: 'block' }}>{errors.title}</span>}
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
          Categoría *
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={inputStyle(Boolean(errors.category))}
        >
          <option value="">Selecciona una categoría...</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.category && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: 4, display: 'block' }}>{errors.category}</span>}
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
          placeholder="Describe tu pregunta con detalle. Puedes incluir bloques de código entre acentos graves triples (```)..."
          rows={8}
          style={{ ...inputStyle(Boolean(errors.description)), resize: 'vertical', fontFamily: 'inherit' }}
        />
        {errors.description && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: 4, display: 'block' }}>{errors.description}</span>}
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
          Adjuntar archivo / Evidencia
        </label>
        <label style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          border: '2px dashed var(--color-border)', borderRadius: 10, padding: 20, textAlign: 'center',
          color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.85rem',
        }} onClick={() => fileInputRef.current?.click()}>
          <Icon name="attachFile" size={18} />
          Arrastra archivos aquí o haz clic para seleccionar (PDF, imágenes, configs)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          accept=".png,.jpg,.jpeg,.gif,.svg,.webp,.pdf,.zip,.doc,.docx,.txt,.md,.json,.csv"
          onChange={(e) => setAttachments(Array.from(e.target.files ?? []))}
        />
        {attachments.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {attachments.map((f, i) => (
              <span key={`${f.name}-${i}`} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--color-accent-light)', color: 'var(--color-accent)',
                fontSize: '0.78rem', padding: '4px 10px', borderRadius: 999,
              }}>
                <Icon name="attachFile" size={13} />
                {f.name}
                <button
                  type="button"
                  onClick={() => setAttachments(attachments.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
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
          disabled={submitting}
          style={{
            padding: '10px 20px', borderRadius: 8, border: 'none',
            background: submitting ? 'var(--color-text-muted)' : 'var(--color-accent)',
            color: 'white', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}
        >
          {submitting ? (
            'Publicando...'
          ) : (
            <>
              <Icon name="send" size={16} /> Publicar Pregunta
            </>
          )}
        </button>
      </div>
    </form>
  )
}