// =====================================================================
// pages/ReusableModules.tsx
// ---------------------------------------------------------------------
// Catálogo de Proyectos Reutilizables. Los datos vienen del backend
// (GET /api/projects) y se refrescan automáticamente al publicar
// un proyecto nuevo desde /new-module (invalidate 'projects').
// =====================================================================
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import Icon from '../components/Icon'

export default function ReusableModules() {
  const navigate = useNavigate()
  const { data: projects = [], isLoading } = useQuery({ queryKey: ['projects'], queryFn: api.projects })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Proyectos Reutilizables</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Código, configuraciones y plantillas compartidas por el equipo.
          </p>
        </div>
        <button
          onClick={() => navigate('/new-module')}
          style={{
            background: 'var(--color-accent)', color: 'white', border: 'none',
            borderRadius: 999, padding: '10px 20px', fontWeight: 600, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          <Icon name="add" size={16} /> Compartir Proyecto
        </button>
      </div>

      {isLoading && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Cargando proyectos...</p>
      )}

      {!isLoading && projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-muted)' }}>
          <Icon name="code" size={40} />
          <p style={{ fontSize: '0.9rem', marginTop: 12 }}>
            Aún no hay proyectos compartidos. ¡Sé el primero en publicar uno!
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {projects.map((project) => (
          <div
            key={project.id}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/projects/${project.id}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') navigate(`/projects/${project.id}`)
            }}
            style={{
              padding: 16,
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              background: 'var(--color-bg-card)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 12,
              cursor: 'pointer',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1rem', marginRight: 4 }}>{project.title}</h3>
                {project.category_name && (
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                    color: project.category_color || 'var(--color-text-secondary)',
                    background: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border)',
                  }}>
                    {project.category_name}
                  </span>
                )}
                {project.status_badge && (
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                    color: '#fff',
                    background: project.status_badge === 'STABLE' ? 'var(--color-success, #15803d)' : 'var(--color-text-muted)',
                  }}>
                    {project.status_badge}
                  </span>
                )}
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  por {project.author_name}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                {project.description}
              </p>
              {project.stack.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                  {project.stack.map((tech) => (
                    <span key={tech} style={{
                      fontSize: '0.75rem', color: 'var(--color-text-muted)',
                      background: 'var(--color-bg-tertiary)', padding: '2px 8px', borderRadius: 4,
                    }}>
                      #{tech}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {project.repo_url && (
                  <a href={project.repo_url} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontSize: '0.85rem', color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="code" size={15} /> Ver repositorio
                  </a>
                )}
                {project.attachments.map((att) => (
                  <a key={att.file_url || att.file_name} href={att.file_url} download
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontSize: '0.85rem', color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="download" size={15} /> {att.file_name}
                  </a>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon name="star" size={14} /> {project.stars_count}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon name="reply" size={14} /> {project.forks_count}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon name="trendingUp" size={14} /> {project.usage_count ?? 0} usos
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}