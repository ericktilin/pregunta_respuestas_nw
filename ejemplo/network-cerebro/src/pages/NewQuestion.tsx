// =====================================================================
// pages/NewQuestion.tsx
// ---------------------------------------------------------------------
// Versión "página completa" del formulario de nueva pregunta
// (el botón del header abre el mismo formulario en un modal).
// =====================================================================
import { useNavigate } from 'react-router-dom'
import QuestionForm from '../components/QuestionForm'

export default function NewQuestion() {
  const navigate = useNavigate()
  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ marginBottom: 24 }}>Nueva Pregunta</h1>
      <QuestionForm onClose={() => navigate('/')} />
    </div>
  )
}