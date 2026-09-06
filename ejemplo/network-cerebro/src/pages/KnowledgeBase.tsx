import { useState } from 'react'

const articles = [
  { id: 1, title: 'Guía de configuración de VPN site-to-site', updated: '15 jul 2026', category: 'Redes', content: '## Resumen\n\nEsta guía describe el proceso para configurar una VPN site-to-site entre el datacenter principal y la sucursal utilizando equipos Cisco.\n\n## Prerrequisitos\n\n- Router Cisco con IOS 15.x+\n- Licencia de seguridad habilitada\n- Direcciones IP públicas en ambos extremos\n\n## Configuración\n\n```cisco\ncrypto isakmp policy 10\n encryption aes-256\n authentication pre-share\n group 5\n!\ncrypto isakmp key MiClaveSecreta address 200.100.50.1\n!\ncrypto ipsec transform-set ESP-AES-SHA esp-aes-256 esp-sha-hmac\n!\ncrypto map CMAP 10 ipsec-isakmp\n set peer 200.100.50.1\n set transform-set ESP-AES-SHA\n match address 110\n!\ninterface Tunnel0\n ip address 10.0.0.1 255.255.255.252\n tunnel source GigabitEthernet0/1\n tunnel destination 200.100.50.1\n crypto map CMAP\n```', author: 'María García' },
  { id: 2, title: 'Solución a error 500 en facturación SAT', updated: '12 jul 2026', category: 'Sistemas de Cobro', content: '## Problema\n\nAl consumir el endpoint de timbrado del SAT, se recibe un error HTTP 500 al enviar facturas con más de 50 conceptos.\n\n## Causa\n\nEl SAT tiene un límite no documentado de 50 conceptos por factura en su ambiente de producción.\n\n## Solución\n\nDividir la factura en múltiples facturas con máximo 50 conceptos cada una.', author: 'Ana Martínez' },
  { id: 3, title: 'Migración de Java 11 a Java 17: checklist', updated: '10 jul 2026', category: 'Desarrollo', content: '## Checklist de Migración\n\n1. Actualizar JDK a Java 17\n2. Verificar compatibilidad de frameworks (Spring Boot 3.x+)\n3. Reemplazar módulos deprecados (javax -> jakarta)\n4. Actualizar plugins de Maven/Gradle\n5. Ejecutar pruebas de regresión', author: 'Carlos López' },
]

export default function KnowledgeBase() {
  const [selectedArticle, setSelectedArticle] = useState<typeof articles[0] | null>(null)
  const [category, setCategory] = useState('Todas')

  const filtered = category === 'Todas'
    ? articles
    : articles.filter((a) => a.category === category)

  const categories = ['Todas', 'Redes', 'Sistemas de Cobro', 'Desarrollo', 'Infraestructura']

  if (selectedArticle) {
    return (
      <div>
        <button
          onClick={() => setSelectedArticle(null)}
          style={{
            background: 'none', border: 'none', color: 'var(--color-accent)',
            cursor: 'pointer', fontSize: '0.9rem', marginBottom: 16, padding: 0,
          }}
        >
          ← Volver a la Base de Conocimiento
        </button>
        <div style={{
          padding: 24, background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)', borderRadius: 12,
        }}>
          <span style={{
            fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-accent)',
            background: 'var(--color-accent-light)', padding: '2px 10px', borderRadius: 20,
          }}>
            {selectedArticle.category}
          </span>
          <h1 style={{ marginTop: 12, marginBottom: 8 }}>{selectedArticle.title}</h1>
          <div style={{
            fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 24,
            paddingBottom: 16, borderBottom: '1px solid var(--color-border-light)',
          }}>
            Por {selectedArticle.author} · Actualizado: {selectedArticle.updated}
          </div>
          <div style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {selectedArticle.content}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Base de Conocimiento</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Artículos técnicos, soluciones documentadas y mejores prácticas.
          </p>
        </div>
        <button style={{
          background: 'var(--color-accent)', color: 'white', border: 'none',
          borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer',
          fontSize: '0.85rem',
        }}>
          + Nuevo Artículo
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: '6px 16px', border: '1px solid var(--color-border)', borderRadius: 20,
              background: cat === category ? 'var(--color-accent-light)' : 'transparent',
              color: cat === category ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              fontWeight: cat === category ? 600 : 400, fontSize: '0.85rem', cursor: 'pointer',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {filtered.map((article) => (
          <div
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            style={{
              padding: 16, border: '1px solid var(--color-border)', borderRadius: 8,
              background: 'var(--color-bg-card)', cursor: 'pointer',
              transition: 'border-color 0.15s ease',
            }}
          >
            <div style={{
              fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600, marginBottom: 4,
              background: 'var(--color-accent-light)', display: 'inline-block',
              padding: '1px 8px', borderRadius: 4,
            }}>
              {article.category}
            </div>
            <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{article.title}</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Por {article.author} · Actualizado: {article.updated}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}