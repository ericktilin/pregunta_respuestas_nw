import { useState } from 'react'

const mockThread = {
  id: 1,
  author: 'Carlos López',
  role: 'Desarrollador Java',
  initials: 'CL',
  date: '25 jul 2026',
  category: '#Redes',
  title: 'Configuración de router Cisco ASR-920 para segmentación VLAN',
  content: `Buen día equipo,

Estamos implementando la segmentación de red en el nuevo datacenter y necesito validar la configuración del Cisco ASR-920.

Actualmente tengo este borrador de configuración:

\`\`\`cisco
interface GigabitEthernet0/1
 description VLAN Trunk to Core
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30,40,50
!
interface Vlan10
 description Red Producción
 ip address 192.168.10.1 255.255.255.0
!\`\`\`

¿Alguien ha trabajado con este modelo? Me preocupa el rendimiento con 50+ VLANs activas.`,
  tickets: ['ASSIS-4521', 'ASSIS-4523'],
}

const mockAnswers = [
  {
    id: 101,
    author: 'María García',
    role: 'Arquitecta de Redes',
    initials: 'MG',
    date: '25 jul 2026',
    content: `Hola Carlos, he trabajado con el ASR-920 en varios proyectos. 

Tu configuración base es correcta. Te recomiendo agregar lo siguiente para optimizar el rendimiento:

\`\`\`cisco
mls qos trust dscp
!
interface Port-channel1
 switchport mode trunk
 switchport trunk allowed vlan add 10,20,30,40,50
!\`\`\`

El ASR-920 maneja hasta 256 VLANs sin problemas de rendimiento si configuras correctamente el QoS.`,
    isAccepted: true,
    votes: 15,
  },
  {
    id: 102,
    author: 'Roberto Díaz',
    role: 'Ingeniero de Redes',
    initials: 'RD',
    date: '26 jul 2026',
    content: `Adicional a lo que menciona María, asegúrate de tener la licencia correcta para el número de VLANs que necesitas. El ASR-920 viene con licencia base que soporta hasta 128 VLANs, pero necesitas la licencia Advanced para más de 128.`,
    isAccepted: false,
    votes: 8,
  },
]

export default function ThreadView() {
  const [ticketId, setTicketId] = useState('')
  const [linkedTickets, setLinkedTickets] = useState(mockThread.tickets)
  const [assisError, setAssisError] = useState(false)
  const [linking, setLinking] = useState(false)

  const handleLinkTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketId.trim()) return
    setLinking(true)
    try {
      // Simulate API call to Assis Now
      await new Promise((resolve) => setTimeout(resolve, 1000))
      if (Math.random() > 0.9) {
        setAssisError(true)
      } else {
        setLinkedTickets((prev) => [...prev, ticketId.trim().toUpperCase()])
        setTicketId('')
        setAssisError(false)
      }
    } finally {
      setLinking(false)
    }
  }

  return (
    <div>
      <div className="thread-main">
        <div className="thread-header">
          <span style={{
            fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-accent)',
            background: 'var(--color-accent-light)', padding: '2px 10px', borderRadius: 20,
          }}>
            {mockThread.category}
          </span>
          <h1 style={{ marginTop: 8, fontSize: '1.4rem' }}>{mockThread.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--color-accent-light)', color: 'var(--color-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600,
            }}>
              {mockThread.initials}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{mockThread.author}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                {mockThread.role} · {mockThread.date}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
          {mockThread.content}
        </div>

        <div style={{ marginTop: 16, padding: 12, background: 'var(--color-bg-tertiary)', borderRadius: 8 }}>
          <strong style={{ fontSize: '0.85rem' }}>🎫 Tickets relacionados de Assis Now:</strong>
          {assisError ? (
            <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Servicio de Assis Now no disponible. Los tickets se mostrarán cuando el servicio se restablezca.
            </div>
          ) : linkedTickets.length > 0 ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {linkedTickets.map((t) => (
                <span key={t} style={{
                  fontSize: '0.8rem', color: 'var(--color-accent)',
                  background: 'var(--color-accent-light)', padding: '2px 10px', borderRadius: 4,
                }}>
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Ningún ticket vinculado a este hilo.
            </div>
          )}

          <form onSubmit={handleLinkTicket} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="ASSIS-XXXX"
              style={{
                flex: 1, padding: '6px 10px', fontSize: '0.8rem',
                border: '1px solid var(--color-border)', borderRadius: 4,
                background: 'var(--color-bg-card)', color: 'var(--color-text-primary)',
              }}
            />
            <button
              type="submit"
              disabled={linking || !ticketId.trim()}
              style={{
                padding: '6px 12px', fontSize: '0.8rem',
                background: linking ? 'var(--color-text-muted)' : 'var(--color-accent)',
                color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer',
                opacity: !ticketId.trim() ? 0.5 : 1,
              }}
            >
              {linking ? 'Vinculando...' : 'Vincular Ticket'}
            </button>
          </form>
        </div>
      </div>

      <div className="answers-section" style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: 16 }}>
          {mockAnswers.length} respuestas
        </h2>
        {mockAnswers.map((answer) => (
          <div
            key={answer.id}
            className="answer-card"
            style={{
              padding: 16,
              marginBottom: 12,
              border: `1px solid ${answer.isAccepted ? 'var(--color-success)' : 'var(--color-border)'}`,
              borderRadius: 8,
              background: answer.isAccepted ? 'var(--color-success-light)' : 'var(--color-bg-card)',
              position: 'relative',
            }}
          >
            {answer.isAccepted && (
              <div style={{
                position: 'absolute', top: -1, right: 16,
                background: 'var(--color-success)', color: 'white',
                padding: '2px 12px', borderRadius: '0 0 6px 6px',
                fontSize: '0.75rem', fontWeight: 700,
              }}>
                ✅ Solución Aceptada
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--color-accent-light)', color: 'var(--color-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: '0.75rem',
              }}>
                {answer.initials}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{answer.author}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {answer.role} · {answer.date}
                </div>
              </div>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{answer.content}</div>
            <div style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              👍 {answer.votes} votos · <a href="#" style={{ fontSize: '0.8rem' }}>Responder</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}