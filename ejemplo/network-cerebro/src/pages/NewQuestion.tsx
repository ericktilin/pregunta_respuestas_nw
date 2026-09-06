import { useState } from 'react'

export default function NewQuestion() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Redes')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'El título es obligatorio'
    else if (title.trim().length < 10) errs.title = 'El título debe tener al menos 10 caracteres'
    if (!description.trim()) errs.description = 'La descripción es obligatoria'
    else if (description.trim().length < 20) errs.description = 'Describe tu problema con más detalle (mín. 20 caracteres)'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      alert('Pregunta publicada exitosamente')
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ marginBottom: 24 }}>Nueva Pregunta</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Título *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Configuración de VPN sitio a sitio con Cisco"
            style={{
              width: '100%', padding: '10px 12px',
              border: `1px solid ${errors.title ? 'var(--color-danger)' : 'var(--color-border)'}`,
              borderRadius: 8, background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', fontSize: '0.9rem',
            }}
          />
          {errors.title && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: 4, display: 'block' }}>{errors.title}</span>}
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 8, background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', fontSize: '0.9rem',
            }}
          >
            <option>Redes</option>
            <option>Sistemas de Cobro</option>
            <option>Desarrollo</option>
            <option>Infraestructura</option>
            <option>Seguridad</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Descripción *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe tu problema o pregunta con detalle..."
            rows={8}
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
            placeholder="Ej: cisco, vpn, redes (separadas por coma)"
            style={{
              width: '100%', padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 8, background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', fontSize: '0.9rem',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>Archivos adjuntos</label>
          <div style={{
            border: '2px dashed var(--color-border)',
            borderRadius: 8, padding: 24, textAlign: 'center',
            color: 'var(--color-text-muted)', cursor: 'pointer',
          }}>
            Arrastra archivos aquí o haz clic para seleccionar (PDF, imágenes, configs)
          </div>
        </div>
        <button type="submit" style={{
          background: 'var(--color-accent)', color: 'white', border: 'none',
          borderRadius: 8, padding: '12px 24px', fontWeight: 600, fontSize: '0.95rem',
          cursor: 'pointer', alignSelf: 'flex-start',
        }}>
          Publicar Pregunta
        </button>
      </form>
    </div>
  )
}