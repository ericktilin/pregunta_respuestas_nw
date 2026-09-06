export default function Profile() {
  const user = {
    name: 'Carlos López',
    role: 'Desarrollador Java',
    initials: 'CL',
    expertise: ['Java', 'Spring Boot', 'Microservicios', 'APIs REST'],
    stats: { questions: 12, answers: 48, solutions: 23 },
    recentActivity: [
      { type: 'Respuesta', title: 'Solución a error de conexión JDBC', date: 'Hace 2 días' },
      { type: 'Pregunta', title: 'Configuración de router Cisco ASR-920', date: 'Hace 3 días' },
      { type: 'Solución aceptada', title: 'Optimización de consultas JPA', date: 'Hace 1 semana' },
    ],
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        gap: 24,
        padding: 24,
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        marginBottom: 24,
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--color-accent-light)', color: 'var(--color-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '1.5rem', flexShrink: 0,
        }}>
          {user.initials}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ marginBottom: 2 }}>{user.name}</h1>
          <div style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}>{user.role}</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {user.expertise.map((e) => (
              <span key={e} style={{
                fontSize: '0.75rem', color: 'var(--color-accent)',
                background: 'var(--color-accent-light)', padding: '2px 10px', borderRadius: 20,
              }}>
                {e}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Preguntas', value: user.stats.questions },
          { label: 'Respuestas', value: user.stats.answers },
          { label: 'Soluciones', value: user.stats.solutions },
        ].map((s) => (
          <div key={s.label} style={{
            flex: 1, textAlign: 'center', padding: 16,
            background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
            borderRadius: 8,
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-accent)' }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h3 style={{ marginBottom: 12 }}>Actividad Reciente</h3>
        {user.recentActivity.map((a, i) => (
          <div key={i} style={{
            display: 'flex', gap: 12, padding: '12px 0',
            borderBottom: '1px solid var(--color-border-light)',
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600, minWidth: 110 }}>{a.type}</span>
            <span style={{ flex: 1 }}>{a.title}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{a.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}