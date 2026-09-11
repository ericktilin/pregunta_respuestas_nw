// =====================================================================
// pages/Categories.tsx
// ---------------------------------------------------------------------
// Pantalla "Categorías Técnicas": grid de tarjetas con acceso directo.
// Al hacer clic redirige al feed filtrando por esa categoría.
// =====================================================================
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import Icon, { type IconName } from '../components/Icon'
import styles from './Categories.module.css'

// Icono representativo por categoría.
const CATEGORY_ICONS: Record<string, IconName> = {
  general: 'forum',
  redes: 'link',
  desarrollo: 'code',
  marketing: 'trendingUp',
  administracion: 'description',
}

export default function Categories() {
  const navigate = useNavigate()
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: api.categories,
  })

  return (
    <div>
      <h1 className={styles.title}>Categorías Técnicas</h1>
      <p className={styles.subtitle}>
        Explora contenido por categoría técnica. Haz clic en una categoría para
        filtrar el feed.
      </p>

      {isLoading && <div className={styles.emptyState}>Cargando categorías...</div>}

      <div className={styles.grid}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={styles.card}
            onClick={() => navigate(`/?category=${cat.slug}`)}
            style={{ '--accent': cat.color_code } as React.CSSProperties}
          >
            <div className={styles.iconWrap}>
              <Icon name={CATEGORY_ICONS[cat.slug] || 'category'} size={24} />
            </div>
            <h3 className={styles.name}>{cat.name}</h3>
            <p className={styles.description}>{cat.description}</p>
            <div className={styles.meta}>
              <span className={styles.count}>{cat.questions_count}</span>
              <span>preguntas activas</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}