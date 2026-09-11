// =====================================================================
// pages/NewModule.tsx
// ---------------------------------------------------------------------
// Formulario "Compartir Proyecto / Módulo Reutilizable".
// Guarda en Oracle: projects + project_stack + attachments (archivo).
// Al enviar, invalida el catálogo de proyectos para que reaparezca la
// tarjeta recién creada al volver a /reusable-modules.
// =====================================================================
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import Icon from '../components/Icon'

const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  border: '1px solid var(--color-border)',
  borderRadius: 8, background: 'var(--color-bg-card)', color: 'var(--color-text-primary)',
  fontSize: '0.9rem', outline: 'none',
}

export default function NewModule() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [description, setDescription] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [stack, setStack] = useState('')
  const [readme, setReadme] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: api.categories })

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'El título del proyecto es obligatorio'
    if (!categorySlug) errs.category = 'Selecciona una categoría'
    if (!description.trim()) errs.description = 'La descripción corta es obligatoria'
    if (!repoUrl.trim()) errs.repoUrl = 'La URL del repositorio es obligatoria'
    else if (!/^https?:\/\/.+\..+/.test(repoUrl.trim())) {
      errs.repoUrl = 'Debe ser una URL válida (https://github.com/..., gitlab, intranet...)'
    }
    if (!stack.trim()) errs.stack = 'Indica al menos una tecnología (separadas por coma)'
    if (!file) errs.attachment = 'Adjunta un archivo (ZIP, PDF, DOC, TXT o MD)'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const stackList = stack
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const formData = new FormData()
    formData.append('title', title.trim())
    formData.append('category_slug', categorySlug)
    formData.append('description', description.trim())
    formData.append('repo_url', repoUrl.trim())
    formData.append('stack', JSON.stringify(stackList))
    formData.append('readme', readme.trim())
    if (file) formData.append('attachment', file)

    setSubmitting(true)
    setServerError('')
    try {
      await api.createProject(formData)
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      navigate('/reusable-modules')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'No se pudo publicar el proyecto')
    } finally {
      setSubmitting(false)
    }
  }

  const requireError = (field: string) =>
    errors[field] ? { borderColor: 'var(--color-danger)' } : undefined

  const label = { display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' } as const
  const errorText = (msg?: string) =>
    msg ? (
      <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: 4, display: 'block' }}>
        {msg}
      </span>
    ) : null

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ marginBottom: 4 }}>Compartir Proyecto / Módulo Reutilizable</h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
        Tu módulo quedará visible en el catálogo de Proyectos Reutilizables.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={label}>Título del Proyecto *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Central Logger"
            style={{ ...fieldStyle, ...requireError('title') }}
          />
          {errorText(errors.title)}
        </div>

        <div>
          <label style={label}>Categoría *</label>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            style={{ ...fieldStyle, ...requireError('category') }}
          >
            <option value="">Selecciona una categoría...</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          {errorText(errors.category)}
        </div>

        <div>
          <label style={label}>Descripción corta *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Qué hace tu módulo, cómo usarlo y qué problema resuelve..."
            rows={4}
            style={{ ...fieldStyle, ...requireError('description'), resize: 'vertical', fontFamily: 'inherit' }}
          />
          {errorText(errors.description)}
        </div>

        <div>
          <label style={label}>URL del Repositorio / Código Fuente *</label>
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/empresa/central-logger (GitHub, GitLab o Intranet)"
            style={{ ...fieldStyle, ...requireError('repoUrl') }}
          />
          {errorText(errors.repoUrl)}
        </div>

        <div>
          <label style={label}>Stack Tecnológico (etiquetas) *</label>
          <input
            type="text"
            value={stack}
            onChange={(e) => setStack(e.target.value)}
            placeholder="Ej: React, Node.js, Oracle, Python (separadas por coma)"
            style={{ ...fieldStyle, ...requireError('stack') }}
          />
          {errorText(errors.stack)}
        </div>

        <div>
          <label style={label}>README.md (Descripción, Instalación, Configuración)</label>
          <textarea
            value={readme}
            onChange={(e) => setReadme(e.target.value)}
            placeholder={'# Nombre del módulo\n\n## Descripción\n\n## Instalación\n\n## Configuración'}
            rows={6}
            style={{ ...fieldStyle, resize: 'vertical', fontFamily: 'monospace' }}
          />
        </div>

        <div>
          <label style={label}>Archivo Adjunto / Manual *</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              ...fieldStyle,
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              color: file ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              ...requireError('attachment'),
            }}
          >
            <Icon name="attachFile" size={16} />
            <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {file ? file.name : 'Haz clic para elegir un archivo (ZIP, PDF, DOC, TXT, MD — máx 20 MB)'}
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,.pdf,.doc,.docx,.txt,.md"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            style={{ display: 'none' }}
          />
          {errorText(errors.attachment)}
        </div>

        {serverError && (
          <div style={{
            padding: 12, borderRadius: 8, fontSize: '0.85rem', color: 'var(--color-danger)',
            border: '1px solid var(--color-danger)', background: 'var(--color-danger-bg, transparent)',
          }}>
            {serverError}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: 'var(--color-accent)', color: 'white', border: 'none',
              borderRadius: 999, padding: '12px 24px', fontWeight: 600, fontSize: '0.95rem',
              cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1,
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            <Icon name="send" size={16} />
            {submitting ? 'Publicando...' : 'Publicar Proyecto'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/reusable-modules')}
            style={{
              background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)',
              borderRadius: 999, padding: '12px 24px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}