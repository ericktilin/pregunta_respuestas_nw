// =====================================================================
// components/AttachmentList.tsx
// ---------------------------------------------------------------------
// Bloque visual de archivos adjuntos: icono del archivo, nombre, tamaño
// y botón "Descargar" (<a href download>). Si el array llega vacío no
// se renderiza nada. Usado en preguntas, respuestas y proyectos.
// =====================================================================
import type { Attachment } from '../api/client'
import Icon, { type IconName } from './Icon'
import styles from './AttachmentList.module.css'

interface AttachmentListProps {
  attachments?: Attachment[]
  title?: string
}

function fileIcon(fileName: string): IconName {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'pdf'].includes(ext || '')) {
    return 'description'
  }
  if (['zip', 'rar', '7z', 'gz', 'doc', 'docx', 'xls', 'xlsx'].includes(ext || '')) {
    return 'description'
  }
  if (['md', 'txt', 'log', 'json', 'csv', 'sql', 'xml', 'yml', 'yaml'].includes(ext || '')) {
    return 'code'
  }
  return 'attachFile'
}

function formatSize(bytes?: number) {
  if (!bytes || bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export default function AttachmentList({ attachments, title = 'Archivos adjuntos' }: AttachmentListProps) {
  const items = Array.isArray(attachments) ? attachments.filter((a) => a && a.file_url) : []
  if (items.length === 0) return null

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <Icon name="attachFile" size={14} /> {title}
      </div>
      <div className={styles.list}>
        {items.map((att) => (
          <div key={att.file_url || att.file_name} className={styles.item}>
            <Icon name={fileIcon(att.file_name)} size={18} className={styles.fileIcon} />
            <span className={styles.name} title={att.file_name}>
              {att.file_name}
            </span>
            {formatSize(att.file_size) && (
              <span className={styles.size}>{formatSize(att.file_size)}</span>
            )}
            <a className={styles.download} href={att.file_url} download>
              <Icon name="download" size={14} /> Descargar
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}