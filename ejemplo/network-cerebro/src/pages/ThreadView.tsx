// =====================================================================
// pages/ThreadView.tsx
// ---------------------------------------------------------------------
// Pantalla "Detalle de pregunta":
//   - Título, metadatos del autor y badge de estado
//   - Cuerpo con soporte de bloques de código 
//   - Respuestas jerárquicas (hilo): "Responder" permite contestar a una
//     respuesta específica (respuestas anidadas vía parent_answer_id)
//   - Like y Guardar persistentes (GET /users/me/interactions)
//   - Adjuntos descargables en pregunta y respuestas / "Solución Aceptada"
//   - Caja para escribir una nueva respuesta
// =====================================================================
import { Fragment, useRef, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type Answer, type Question } from '../api/client'
import AttachmentList from '../components/AttachmentList'
import Icon from '../components/Icon'
import styles from './ThreadView.module.css'

interface ContentBlock {
  type: 'text' | 'code'
  content: string
  lang?: string
}

// Divide el texto en párrafos y bloques de código
function parseBlocks(text: string): ContentBlock[] {
  const blocks: ContentBlock[] = []
  const regex = /```(\w*)\r?\n([\s\S]*?)```/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) blocks.push({ type: 'text', content: text.slice(last, match.index) })
    blocks.push({ type: 'code', content: match[2], lang: match[1] || 'código' })
    last = regex.lastIndex
  }
  if (last < text.length) blocks.push({ type: 'text', content: text.slice(last) })
  return blocks.length ? blocks : [{ type: 'text', content: text }]
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'hace un momento'
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `hace ${days} d`
  return `hace ${Math.floor(days / 30)} mes${days >= 60 ? 'es' : ''}`
}

function hexA(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function statusInfo(status: Question['status']) {
  switch (status) {
    case 'resolved':
      return { label: 'Resuelta', className: styles.statusResolved }
    case 'in_progress':
      return { label: 'En proceso', className: styles.statusInProgress }
    default:
      return { label: 'Sin resolver', className: styles.statusOpen }
  }
}

// Bloque de código con botón copiar.
function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // portapapeles no disponible
    }
  }
  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        <span className={styles.codeLang}>{lang || 'código'}</span>
        <button className={styles.copyBtn} onClick={copy}>
          <Icon name={copied ? 'checkCircle' : 'contentCopy'} size={14} />
          {copied ? 'Copiado' : 'Copiar código'}
        </button>
      </div>
      <pre className={styles.codePre}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

// Renderiza texto plano + bloques de código.
function RichContent({ text }: { text: string }) {
  const blocks = parseBlocks(text)
  return (
    <>
      {blocks.map((b, i) =>
        b.type === 'code' ? (
          <CodeBlock key={i} code={b.content} lang={b.lang} />
        ) : (
          <p key={i} className={styles.paragraph}>
            {b.content}
          </p>
        ),
      )}
    </>
  )
}

// Tarjeta de autor (pregunta o respuesta).
function AuthorLine({
  initials,
  name,
  role,
  date,
}: {
  initials: string
  name: string
  role: string
  date: string
}) {
  return (
    <div className={styles.authorLine}>
      <div className={styles.authorAvatar}>{initials}</div>
      <div>
        <div className={styles.authorName}>{name}</div>
        <div className={styles.authorMeta}>
          {role} · {timeAgo(date)}
        </div>
      </div>
    </div>
  )
}

export default function ThreadView() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [postError, setPostError] = useState('')
  const answerRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachments, setAttachments] = useState<File[]>([])
  const [ticketOpen, setTicketOpen] = useState(false)
  const [ticket, setTicket] = useState('')

  // Hilo: respuesta que se está contestando + su texto.
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyError, setReplyError] = useState('')

  const { data: question, isLoading, isError } = useQuery({
    queryKey: ['question', id],
    queryFn: () => api.question(id!),
  })

  // Likes y guardados del usuario -> estado de botones al recargar.
  const { data: interactions } = useQuery({
    queryKey: ['me-interactions'],
    queryFn: api.interactions,
  })
  const votedIds = new Set(interactions?.voted ?? [])
  const savedIds = new Set(interactions?.saved ?? [])

  // Usuario actual: permite mostrar el botón de "Solución Aceptada"
  // únicamente al autor de la pregunta.
  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: api.me,
  })

  const [voted, setVoted] = useState<boolean | null>(null)
  const [saved, setSaved] = useState<boolean | null>(null)

  // Envuelve la selección del área con before/after (markdown) o inserta un guía.
  const applyFormat = (before: string, after: string, fallback: string) => {
    const ta = answerRef.current
    if (!ta) return
    const s = ta.selectionStart
    const e = ta.selectionEnd
    const selected = answer.slice(s, e) || fallback
    setAnswer(answer.slice(0, s) + before + selected + after + answer.slice(e))
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(s + before.length, s + before.length + selected.length)
    })
  }

  // Inserta un elemento de lista  al inicio de la línea actual.
  const insertList = () => {
    const ta = answerRef.current
    if (!ta) return
    const s = ta.selectionStart
    const lineStart = answer.lastIndexOf('\n', s - 1) + 1
    setAnswer(answer.slice(0, lineStart) + '- ' + answer.slice(lineStart))
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(s + 2, s + 2)
    })
  }

  // Inserta un bloque de código .
  const insertCode = () => applyFormat('```\n', '\n```', 'aquí tu código')

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !answer.trim()) return
    // El ticket se adjunta al final del cuerpo hasta que assisnow este.
    let content = answer.trim()
    if (ticket.trim()) content += `\n\nTicket vinculado: ${ticket.trim()}`
    setSubmitting(true)
    setPostError('')
    try {
      await api.createAnswer(id, content, null, attachments)
      setAnswer('')
      setTicket('')
      setAttachments([])
      queryClient.invalidateQueries({ queryKey: ['question', id] })
      queryClient.invalidateQueries({ queryKey: ['me-activity'] })
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'No se pudo publicar la respuesta')
    } finally {
      setSubmitting(false)
    }
  }

  // Responder directamente a una respuesta (hilo anidado).
  const submitReply = async (parentId: number) => {
    if (!id || !replyText.trim()) return
    setSubmitting(true)
    setReplyError('')
    try {
      await api.createAnswer(id, replyText.trim(), parentId)
      setReplyText('')
      setReplyTo(null)
      queryClient.invalidateQueries({ queryKey: ['question', id] })
      queryClient.invalidateQueries({ queryKey: ['me-activity'] })
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : 'No se pudo publicar la respuesta')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async () => {
    if (!question) return
    try {
      const res = await api.vote(question.id)
      setVoted(res.voted)
      queryClient.setQueryData<Question & { answers: Answer[] }>(['question', id], (old) =>
        old ? { ...old, votes_count: res.votes_count } : old,
      )
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      queryClient.invalidateQueries({ queryKey: ['me-interactions'] })
    } catch {
      // error silencioso por ahora
    }
  }

  const handleSave = async () => {
    if (!question) return
    try {
      const res = await api.save(question.id)
      setSaved(res.saved)
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      queryClient.invalidateQueries({ queryKey: ['me-interactions'] })
      queryClient.invalidateQueries({ queryKey: ['me-questions'] })
    } catch {
      // error silencioso por ahora
    }
  }

  // Marca/desmarca "Solución Aceptada" (solo el autor de la pregunta).
  const handleAccept = async (answerId: number, isAccepted: boolean) => {
    if (!id) return
    try {
      await api.markAnswerAccepted(id, answerId, !isAccepted)
      queryClient.invalidateQueries({ queryKey: ['question', id] })
    } catch {
      // error silencioso por ahora
    }
  }

  if (isLoading) return <div className={styles.emptyState}>Cargando pregunta...</div>
  if (isError || !question) {
    return (
      <div className={styles.emptyState}>
        <Icon name="helpOutline" size={40} />
        <h3>No se encontró la pregunta</h3>
        <Link className={styles.backLink} to="/">
          Volver al feed
        </Link>
      </div>
    )
  }

  const status = statusInfo(question.status)
  const answers: Answer[] = question.answers ?? []
  const isLiked = voted ?? votedIds.has(question.id)
  const isSaved = saved ?? savedIds.has(question.id)
  const isOwner = me?.id === question.author_id

  // Mapa padre → hijos para armar el hilo de respuestas anidadas.
  const childrenByParent = new Map<number | null, Answer[]>()
  for (const a of answers) {
    const key = a.parent_answer_id ?? null
    if (!childrenByParent.has(key)) childrenByParent.set(key, [])
    childrenByParent.get(key)!.push(a)
  }

  // Renderiza una respuesta y, recursivamente, sus respuestas hijas.
  const renderAnswer = (answerLine: Answer, depth: number): ReactNode => {
    const isAccepted = answerLine.is_accepted === 1
    const children = childrenByParent.get(answerLine.id) ?? []
    const className =
      depth > 0 ? styles.answerReply : isAccepted ? styles.answerAccepted : styles.answer
    return (
      <Fragment key={answerLine.id}>
        <div className={className}>
          {depth > 0 && <div className={styles.replyLine}>Respuesta en hilo</div>}
          {isAccepted && (
            <div className={styles.acceptedBadge}>
              <Icon name="checkCircle" size={14} /> Solución Aceptada
            </div>
          )}
          <AuthorLine
            initials={answerLine.author_initials}
            name={answerLine.author_name}
            role={answerLine.author_role}
            date={answerLine.created_at}
          />
          <div className={styles.answerBody}>
            <RichContent text={answerLine.body_text ?? ''} />
            <AttachmentList attachments={answerLine.attachments} title="Adjuntos de la respuesta" />
          </div>
          <div className={styles.answerFooter}>
            <span className={styles.stat}>
              <Icon name="thumbUp" size={14} /> {answerLine.votes_count} votos
            </span>
            {isOwner && (
              <button
                className={`${styles.acceptBtn} ${isAccepted ? styles.acceptBtnActive : ''}`}
                onClick={() => handleAccept(answerLine.id, isAccepted)}
                title={isAccepted ? 'Quitar como solución' : 'Marcar como solución'}
              >
                <Icon name="checkCircle" size={14} />
                {isAccepted ? 'Solución aceptada' : 'Marcar como solución'}
              </button>
            )}
            {/* Responder a esta respuesta específica  */}
            <button
              className={styles.replyBtn}
              onClick={() => {
                setReplyTo(replyTo === answerLine.id ? null : answerLine.id)
                setReplyText('')
                setReplyError('')
              }}
            >
              <Icon name="reply" size={14} /> Responder
            </button>
          </div>

          {/* Formulario de respuesta en hilo */}
          {replyTo === answerLine.id && (
            <div className={styles.replyBox}>
              <textarea
                className={styles.replyTextarea}
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Responder a ${answerLine.author_name}...`}
              />
              {replyError && <div className={styles.formError}>{replyError}</div>}
              <div className={styles.replyActions}>
                <button
                  className={styles.replyCancel}
                  onClick={() => {
                    setReplyTo(null)
                    setReplyText('')
                  }}
                >
                  Cancelar
                </button>
                <button
                  className={styles.replySubmit}
                  disabled={submitting || !replyText.trim()}
                  onClick={() => submitReply(answerLine.id)}
                >
                  <Icon name="send" size={14} />
                  {submitting ? 'Publicando...' : 'Responder'}
                </button>
              </div>
            </div>
          )}
        </div>
        {children.map((child) => renderAnswer(child, depth + 1))}
      </Fragment>
    )
  }

  return (
    <div>
      <Link className={styles.backLink} to="/">
        <Icon name="arrowBack" size={15} /> Volver al feed
      </Link>

      {/* Encabezado de la pregunta */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <span
            className={styles.categoryBadge}
            style={{
              color: question.category_color || 'var(--color-text-secondary)',
              background: hexA(question.category_color || '#64748b', 0.16),
            }}
          >
            {question.category_name}
          </span>
          <span className={status.className}>{status.label}</span>
        </div>
        <h1 className={styles.title}>{question.title}</h1>
        <AuthorLine
          initials={question.author_initials}
          name={question.author_name}
          role={question.author_role}
          date={question.created_at}
        />

        {/* Métricas rápidas + like/guardar  */}
        <div className={styles.statsRow}>
          <button
            className={`${styles.statBtn} ${isLiked ? styles.statBtnActive : ''}`}
            onClick={handleVote}
            title={isLiked ? 'Quitar like' : 'Me gusta'}
          >
            <Icon name="thumbUp" size={15} /> {question.votes_count} votos
          </button>
          <span className={styles.stat}>
            <Icon name="chat" size={15} /> {answers.length} respuestas
          </span>
          <button
            className={`${styles.statBtn} ${isSaved ? styles.statBtnActive : ''}`}
            onClick={handleSave}
            title={isSaved ? 'Quitar de guardados' : 'Guardar'}
          >
            <Icon name={isSaved ? 'bookmark' : 'bookmarkBorder'} size={15} /> Guardar
          </button>
        </div>
      </div>

      {/* Cuerpo de la pregunta */}
      <div className={styles.card}>
        <RichContent text={question.body_text ?? ''} />
        <AttachmentList attachments={question.attachments} title="Adjuntos de la pregunta" />
        {question.tags && question.tags.length > 0 && (
          <div className={styles.tags}>
            {question.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Respuestas (con hilos anidados) */}
      <h2 className={styles.answersTitle}>{answers.length} respuestas</h2>

      <div className={styles.answersList}>
        {answers
          .filter((a) => !a.parent_answer_id)
          .map((answerLine) => renderAnswer(answerLine, 0))}

        {answers.length === 0 && (
          <div className={styles.emptyState}>
            <p>Aún no hay respuestas. ¡Sé el primero en responder!</p>
          </div>
        )}
      </div>

      {/* Caja para escribir una respuesta */}
      <div className={styles.card}>
        <h3 className={styles.answerFormTitle}>
          <Icon name="reply" size={16} /> Tu respuesta
        </h3>
        <form onSubmit={submitAnswer}>
          {/* Barra de formato: B, I, lista, enlace, bloque de código */}
          <div className={styles.formatBar}>
            <button
              type="button"
              className={styles.formatBtn}
              title="Negrita"
              onClick={() => applyFormat('**', '**', 'texto')}
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              className={styles.formatBtn}
              title="Cursiva"
              onClick={() => applyFormat('*', '*', 'texto')}
            >
              <em>I</em>
            </button>
            <button
              type="button"
              className={styles.formatBtn}
              title="Lista"
              onClick={insertList}
            >
              :=
            </button>
            <button
              type="button"
              className={styles.formatBtn}
              title="Enlace"
              onClick={() => applyFormat('[', '](https://enlace)', 'enlace')}
            >
              <Icon name="link" size={15} />
            </button>
            <button
              type="button"
              className={styles.formatBtn}
              title="Bloque de código"
              onClick={insertCode}
            >
              {'</>'}
            </button>
          </div>

          <textarea
            ref={answerRef}
            className={styles.answerTextarea}
            rows={5}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Comparte tu solución, referencia comandos, adjunta enlaces a repositorios..."
          />
          {postError && <div className={styles.formError}>{postError}</div>}

          {/* Adjuntos elegidos para la respuesta (se suben al publicar) */}
          {attachments.length > 0 && (
            <div className={styles.attachChips}>
              {attachments.map((f, i) => (
                <span key={i} className={styles.attachChip}>
                  <Icon name="attachFile" size={13} />
                  {f.name}
                  <button
                    type="button"
                    className={styles.attachRemove}
                    onClick={() => setAttachments(attachments.filter((_, j) => j !== i))}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Campo de ticket de assis now  */}
          {ticketOpen && (
            <input
              type="text"
              className={styles.ticketInput}
              value={ticket}
              onChange={(e) => setTicket(e.target.value)}
              placeholder="Pega el ID o URL del ticket (p. ej. SUPPORT-1234)"
            />
          )}

          {/* Acciones inferiores: herramientas + Publicar */}
          <div className={styles.answerToolbar}>
            <div className={styles.toolbarLeft}>
              <button type="button" className={styles.toolBtn} onClick={insertCode}>
                <Icon name="code" size={15} /> Código
              </button>
              <button
                type="button"
                className={styles.toolBtn}
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon name="attachFile" size={15} /> Adjuntar
              </button>
              <button
                type="button"
                className={styles.toolBtn}
                onClick={() => setTicketOpen((v) => !v)}
              >
                Vincular ticket
              </button>
            </div>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || !answer.trim()}
            >
              <Icon name="send" size={16} />
              {submitting ? 'Publicando...' : 'Publicar respuesta'}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => setAttachments(Array.from(e.target.files ?? []))}
          />
        </form>
      </div>
    </div>
  )
}