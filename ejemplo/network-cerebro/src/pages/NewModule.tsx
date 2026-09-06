import { useState } from 'react'

export default function NewModule() {
  const [name, setName] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'El nombre del módulo es obligatorio'
    if (!repoUrl.trim()) errs.repoUrl = 'La URL del repositorio es obligatoria'
    else if (!repoUrl.startsWith('https://github.com/')) errs.repoUrl = 'Debe ser una URL de GitHub válida (https://github.com/...)'
    if (!description.trim()) errs.description = 'La descripción es obligatoria'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      alert('Módulo publicado exitosamente')
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ marginBottom: 24 }}>Compartir Proyecto / Módulo Reutilizable</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Nombre del Módulo *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Central Logger"
            style={{
              width: '100%', padding: '10px 12px',
              border: `1px solid ${errors.name ? 'var(--color-danger)' : 'var(--color-border)'}`,
              borderRadius: 8, background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', fontSize: '0.9rem',
            }}
          />
          {errors.name && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: 4, display: 'block' }}>{errors.name}</span>}
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>URL del Repositorio (GitHub) *</label>
          <input
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/empresa/central-logger"
            style={{
              width: '100%', padding: '10px 12px',
              border: `1px solid ${errors.repoUrl ? 'var(--color-danger)' : 'var(--color-border)'}`,
              borderRadius: 8, background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', fontSize: '0.9rem',
            }}
          />
          {errors.repoUrl && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: 4, display: 'block' }}>{errors.repoUrl}</span>}
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Descripción *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe qué hace tu módulo, cómo usarlo y qué problema resuelve..."
            rows={6}
            style={{
              width: '100%', padding: '10px 12px',
              border: `1px solid ${errors.description ? 'var(--color-danger)' : 'var(--color-border)'}`,
              borderRadius: 8, background: 'var(--color-bg-card)', color: 'var(--color-text-primary)',
              fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit',
            }}
          />
          {errors.description && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: 4, display: 'block' }}>{errors.description}</span>}
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Etiquetas</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Ej: logging, java, spring (separadas por coma)"
            style={{
              width: '100%', padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 8, background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', fontSize: '0.9rem',
            }}
          />
        </div>
        <button type="submit" style={{
          background: 'var(--color-accent)', color: 'white', border: 'none',
          borderRadius: 8, padding: '12px 24px', fontWeight: 600, fontSize: '0.95rem',
          cursor: 'pointer', alignSelf: 'flex-start',
        }}>
          Publicar Módulo
        </button>
      </form>
    </div>
  )
}