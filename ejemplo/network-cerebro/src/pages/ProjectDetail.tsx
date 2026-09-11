// =====================================================================
// pages/ProjectDetail.tsx
// ---------------------------------------------------------------------
// Vista detallada de un Proyecto Reutilizable (/projects/:id):
//   - Columna principal (70%): header azul con métricas y acciones,
//     stack tecnológico, archivos adjuntos y README.md renderizado.
//   - Sidebar (30%): autor, contribuidores, información y repositorio.
// =====================================================================
import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import AttachmentList from '../components/AttachmentList'
import Icon from '../components/Icon'
import styles from './ProjectDetail.module.css'

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Negritas (**texto**) dentro de una línea.
function inline(text: string): ReactNode {
  const parts = text.split('**')
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>,
      )}
    </>
  )
}

// Renderizador de Markdown simplificado: títulos, código, listas y párrafos.
function Markdown({ text }: { text: string }) {
  const lines = (text || '').replace(/\r\n/g, '\n').split('\n')
  const out: ReactNode[] = []
  const para: string[] = []
  const list: string[] = []
  let codeBuf: string[] = []
  let inCode = false
  let key = 0

  const flushPara = () => {
    if (para.length === 0) return
    out.push(
      <p key={key++} className={styles.mdParagraph}>
        {inline(para.join(' '))}
      </p>,
    )
    para.length = 0
  }

  const flushList = () => {
    if (list.length === 0) return
    out.push(
      <ul key={key++} className={styles.mdList}>
        {list.map((li) => (
          <li key={li}>{inline(li)}</li>
        ))}
      </ul>,
    )
    list.length = 0
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('```')) {
      flushPara()
      flushList()
      if (inCode) {
        out.push(
          <pre key={key++} className={styles.mdCode}>
            <code>{codeBuf.join('\n')}</code>
          </pre>,
        )
        codeBuf = []
        inCode = false
      } else {
        inCode = true
      }
      continue
    }
    if (inCode) {
      codeBuf.push(line)
      continue
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(trimmed)
    if (heading) {
      flushPara()
      flushList()
      const level = heading[1].length
      out.push(
        <h3
          key={key++}
          className={level <= 2 ? styles.mdH2 : styles.mdH3}
        >
          {inline(heading[2])}
        </h3>,
      )
      continue
    }
    if (/^[-*]\s+/.test(trimmed)) {
      flushPara()
      list.push(trimmed.replace(/^[-*]\s+/, ''))
      continue
    }
    if (trimmed === '') {
      flushPara()
      flushList()
      continue
    }
    para.push(line)
  }
  flushPara()
  flushList()
  if (inCode && codeBuf.length) {
    out.push(
      <pre key={key++} className={styles.mdCode}>
        <code>{codeBuf.join('\n')}</code>
      </pre>,
    )
  }
  return <>{out}</>
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const [copied, setCopied] = useState(false)

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.project(id!),
  })

  const copyUrl = async () => {
    if (!project) return
    try {
      await navigator.clipboard.writeText(project.repo_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // portapapeles no disponible
    }
  }

  if (isLoading) return <div className={styles.emptyState}>Cargando proyecto...</div>

  if (isError || !project) {
    return (
      <div className={styles.emptyState}>
        <Icon name="helpOutline" size={40} />
        <h3>No se encontró el proyecto</h3>
        <Link className={styles.backLink} to="/reusable-modules">
          Volver al catálogo
        </Link>
      </div>
    )
  }

  const contributors = (project.contributors || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const isStable = project.status_badge === 'STABLE'
  const statusClass = isStable ? styles.badgeStable : styles.badgeDefault

  return (
    <div>
      <Link className={styles.backLink} to="/reusable-modules">
        <Icon name="arrowBack" size={15} /> Volver al catálogo
      </Link>

      <div className={styles.layout}>
        {/* ======= Columna principal (70%) ======= */}
        <div className={styles.main}>
          {/* Encabezado principal: Card Azul */}
          <div className={styles.headerCard}>
            <div className={styles.headerTop}>
              <h1 className={styles.headerTitle}>{project.title}</h1>
              <span className={statusClass}>
                <Icon name="checkCircle" size={13} /> {project.status_badge}
              </span>
            </div>
            <p className={styles.headerDescription}>{project.description}</p>

            <div className={styles.headerMetrics}>
              <span className={styles.metric}>
                <Icon name="star" size={15} /> {project.stars_count} estrellas
              </span>
              <span className={styles.metric}>
                <Icon name="reply" size={15} /> {project.forks_count} forks
              </span>
              <span className={styles.metric}>
                <Icon name="trendingUp" size={15} /> {project.usage_count ?? 0} usos
              </span>
            </div>

            <div className={styles.headerActions}>
              {project.repo_url && (
                <a
                  className={styles.actionPrimary}
                  href={project.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="code" size={16} /> Ver repositorio
                </a>
              )}
              <button className={styles.actionSecondary} onClick={copyUrl}>
                <Icon name={copied ? 'checkCircle' : 'contentCopy'} size={16} />
                {copied ? 'URL copiada' : 'Copiar URL'}
              </button>
            </div>
          </div>

          {/* Stack Tecnológico */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Icon name="code" size={16} /> Stack Tecnológico
            </h2>
            <div className={styles.chips}>
              {project.stack.map((tech) => (
                <span key={tech} className={styles.chip}>
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Archivos Adjuntos */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Icon name="attachFile" size={16} /> Archivos Adjuntos
            </h2>
            <AttachmentList attachments={project.attachments} />
          </section>

          {/* README.md */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Icon name="description" size={16} /> README.md
            </h2>
            <div className={styles.readmeDoc}>
              <div className={styles.readmeHeader}>
                <span className={styles.readmeDots}>
                  <span style={{ background: '#f87171' }} />
                  <span style={{ background: '#fbbf24' }} />
                  <span style={{ background: '#34d399' }} />
                </span>
                <span className={styles.readmeName}>README.md</span>
              </div>
              <div className={styles.readmeBody}>
                <Markdown text={project.readme} />
              </div>
            </div>
          </section>
        </div>

        {/* ======= Sidebar (30%) ======= */}
        <aside className={styles.sidebar}>
          {/* Autor */}
          <section className={styles.sideCard}>
            <h3 className={styles.sideTitle}>Autor</h3>
            <div className={styles.authorRow}>
              <div className={styles.avatar}>{project.author_initials}</div>
              <div>
                <div className={styles.authorNameLine}>{project.author_name}</div>
                <div className={styles.authorRole}>{project.author_role || 'Colaborador'}</div>
              </div>
            </div>
          </section>

          {/* Contribuidores */}
          <section className={styles.sideCard}>
            <h3 className={styles.sideTitle}>Contribuidores</h3>
            {contributors.length > 0 ? (
              <div className={styles.contributors}>
                {contributors.map((initial) => (
                  <div key={initial} className={styles.contributorAvatar} title={initial}>
                    {initial}
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.muted}>Sin contribuidores registrados</p>
            )}
          </section>

          {/* Información del Proyecto */}
          <section className={styles.sideCard}>
            <h3 className={styles.sideTitle}>Información del Proyecto</h3>
            <dl className={styles.infoList}>
              <div className={styles.infoRow}>
                <dt>Estado</dt>
                <dd>
                  <span className={statusClass}>
                    <Icon name="checkCircle" size={12} /> {project.status_badge}
                  </span>
                </dd>
              </div>
              <div className={styles.infoRow}>
                <dt>Última actualización</dt>
                <dd>{formatDate(project.created_at)}</dd>
              </div>
              <div className={styles.infoRow}>
                <dt>Usado en</dt>
                <dd>{project.usage_count ?? 0} proyecto(s)</dd>
              </div>
              <div className={styles.infoRow}>
                <dt>Categoría</dt>
                <dd>{project.category_name}</dd>
              </div>
            </dl>
          </section>

          {/* Repositorio */}
          {project.repo_url && (
            <section className={styles.repoCard}>
              <div className={styles.repoHeader}>
                <Icon name="code" size={18} />
                <div>
                  <div className={styles.repoName}>Repositorio</div>
                  <div className={styles.repoUrlText}>{project.repo_url}</div>
                </div>
              </div>
              <a
                className={styles.repoButton}
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir repositorio <Icon name="arrowBack" size={14} />
              </a>
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}