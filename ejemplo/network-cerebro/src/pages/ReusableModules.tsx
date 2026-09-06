export default function ReusableModules() {
  const modules = [
    {
      name: 'Central Logger',
      description: 'Librería de logging estructurado con soporte para correlación de trazas entre microservicios.',
      repoUrl: 'https://github.com/empresa/central-logger',
      downloads: 47,
      tags: ['logging', 'microservicios', 'java'],
    },
    {
      name: 'SAT Invoice Client',
      description: 'Cliente Java para consumir la API de facturación electrónica del SAT con manejo de CFDI 4.0.',
      repoUrl: 'https://github.com/empresa/sat-invoice-client',
      downloads: 32,
      tags: ['sat', 'facturación', 'java', 'cfdi'],
    },
    {
      name: 'Network Config Templates',
      description: 'Plantillas de configuración para equipos Cisco (routers, switches, firewalls) estandarizadas.',
      repoUrl: 'https://github.com/empresa/network-templates',
      downloads: 28,
      tags: ['cisco', 'redes', 'plantillas'],
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Proyectos Reutilizables</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Código, configuraciones y plantillas compartidas por el equipo.
          </p>
        </div>
        <button style={{
          background: 'var(--color-accent)', color: 'white', border: 'none',
          borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer',
        }}>
          + Compartir Proyecto
        </button>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {modules.map((mod) => (
          <div key={mod.name} style={{
            padding: 16,
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            background: 'var(--color-bg-card)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{mod.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>{mod.description}</p>
              <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                {mod.tags.map((t) => (
                  <span key={t} style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', background: 'var(--color-bg-tertiary)', padding: '2px 8px', borderRadius: 4 }}>#{t}</span>
                ))}
              </div>
              <a href={mod.repoUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                📦 Ver en GitHub
              </a>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              <div>⬇️ {mod.downloads}</div>
              <div>descargas</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}