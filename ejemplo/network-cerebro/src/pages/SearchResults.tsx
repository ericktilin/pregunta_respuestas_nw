import { useState } from 'react'

export default function SearchResults() {
  const [query, setQuery] = useState('vlan')
  const [filter, setFilter] = useState('Todas')

  const results = query
    ? [
        { title: 'Configuración de router Cisco ASR-920 para segmentación VLAN', snippet: '...implementando segmentación de red en el nuevo datacenter...', type: 'Pregunta', author: 'Carlos López' },
        { title: 'Guía de configuración de VLANs en switches Cisco', snippet: 'Procedimiento estándar para crear y administrar VLANs...', type: 'Base de Conocimiento', author: 'María García' },
      ]
    : []

  const filters = ['Todas', 'Preguntas', 'Base de Conocimiento', 'Módulos']

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca soluciones, configuraciones de router, sistemas de cobro..."
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {query && results.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            {results.length} resultados para "{query}"
          </span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '4px 12px', border: '1px solid var(--color-border)', borderRadius: 16,
              background: f === filter ? 'var(--color-accent-light)' : 'transparent',
              color: f === filter ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              fontSize: '0.8rem', cursor: 'pointer', fontWeight: f === filter ? 600 : 400,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {query && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
          <h3 style={{ color: 'var(--color-text-secondary)', marginBottom: 8 }}>
            No se encontraron resultados
          </h3>
          <p style={{ fontSize: '0.9rem' }}>
            Intenta ampliar tu búsqueda o explora por categoría
          </p>
        </div>
      )}

      {query && results.length > 0 && results.map((r) => (
        <div key={r.title} style={{
          padding: 16,
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          background: 'var(--color-bg-card)',
          marginBottom: 8,
          cursor: 'pointer',
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-accent)',
              background: 'var(--color-accent-light)', padding: '1px 8px', borderRadius: 4,
            }}>
              {r.type}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{r.author}</span>
          </div>
          <h3 style={{ fontSize: '0.95rem', marginBottom: 4 }}>{r.title}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{r.snippet}</p>
        </div>
      ))}

      {!query && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
          <p style={{ fontSize: '0.9rem' }}>Escribe algo para buscar en toda la base de conocimiento</p>
        </div>
      )}
    </div>
  )
}