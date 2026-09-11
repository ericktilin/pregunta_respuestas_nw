// =====================================================================
// components/Modal.tsx
// ---------------------------------------------------------------------
// Ventana emergente con overlay oscuro (estilo que pide el diseño:
// fondo oscurecido + tarjeta centrada).
// =====================================================================
import { useEffect, type ReactNode } from 'react'
import Icon from './Icon'
import styles from './Modal.module.css'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}

export default function Modal({ open, title, onClose, children, wide }: ModalProps) {
  // Cerrar con la tecla Escape y bloquear el scroll de fondo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.dialog} ${wide ? styles.dialogWide : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}