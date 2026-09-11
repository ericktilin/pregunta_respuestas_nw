// =====================================================================
// api/client.ts
// Cliente HTTP hacia el backend (proxy de Vite). El SSO lo resuelve el
// backend con los headers X-User-*; aquí solo se envían los datos.
// =====================================================================

const BASE_URL = '/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  // Para multipart (FormData) el navegador pone su propio Content-Type con el boundary.
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error || `Error ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ---- Tipos compartidos ----------------------------------------------

export interface Category {
  id: number
  name: string
  slug: string
  description: string
  color_code: string
  questions_count: number
}

export interface Question {
  id: number
  title: string
  body_text: string
  status: 'open' | 'in_progress' | 'resolved'
  votes_count: number
  created_at: string
  author_id: number
  author_name: string
  author_role: string
  author_initials: string
  category_id: number
  category_name: string
  category_slug: string
  category_color: string
  answers_count: number
  tags: string[]
  attachments: Attachment[]
}

export interface Answer {
  id: number
  body_text: string
  is_accepted: number
  votes_count: number
  parent_answer_id: number | null
  created_at: string
  author_id: number
  author_name: string
  author_role: string
  author_initials: string
  attachments: Attachment[]
}

export interface User {
  id: number
  external_intranet_id: string
  full_name: string
  role_title: string
  avatar_initials: string
  reputation_points: number
}

export interface MyQuestionsResponse {
  metrics: { total: number; resolved: number; in_progress: number; open: number; saved: number }
  questions: Question[]
  savedQuestions: Question[]
}

export interface Project {
  id: number
  title: string
  description: string
  repo_url: string
  status_badge: string
  stars_count: number
  forks_count: number
  usage_count: number
  contributors: string
  readme: string
  created_at: string
  author_name: string
  author_initials: string
  author_role: string
  category_name: string
  category_slug: string
  category_color: string
  stack: string[]
  attachments: Attachment[]
}

export interface Attachment {
  id?: number
  file_name: string
  file_url: string
  file_size?: number
}

// ---- Endpoints ------------------------------------------------------

export const api = {
  health: () => request<{ ok: boolean }>('/health'),

  categories: () => request<Category[]>('/categories'),

  questions: (params: Record<string, string>) =>
    request<Question[]>(`/questions?${new URLSearchParams(params)}`),

  question: (id: number | string) =>
    request<Question & { answers: Answer[] }>(`/questions/${id}`),

  // Envía una pregunta nueva (opcionalmente con archivos adjuntos).
  createQuestion: (
    payload: { title: string; body_text: string; category_slug: string; tags: string[] },
    attachments?: File[],
  ) =>
    request<{ id: number }>('/questions', {
      method: 'POST',
      body:
        attachments && attachments.length > 0
          ? (() => {
              const fd = new FormData()
              fd.append('title', payload.title)
              fd.append('body_text', payload.body_text)
              fd.append('category_slug', payload.category_slug)
              fd.append('tags', JSON.stringify(payload.tags))
              attachments.forEach((f) => fd.append('attachments', f))
              return fd
            })()
          : JSON.stringify(payload),
    }),

  // Envía una respuesta a la pregunta :id. parentId opcional -> hilo anidado.
  // files opcional -> archivos adjuntos (PNG/PDF/otros).
  createAnswer: (
    id: number | string,
    body_text: string,
    parentId?: number | null,
    files?: File[],
  ) =>
    request<{ id: number }>(`/questions/${id}/answers`, {
      method: 'POST',
      body:
        files && files.length > 0
          ? (() => {
              const fd = new FormData()
              fd.append('body_text', body_text)
              if (parentId) fd.append('parent_answer_id', String(parentId))
              files.forEach((f) => fd.append('attachments', f))
              return fd
            })()
          : JSON.stringify({ body_text, ...(parentId ? { parent_answer_id: parentId } : {}) }),
    }),

  // Actualiza una pregunta propia (editar).
  updateQuestion: (
    id: number | string,
    payload: { title?: string; body_text?: string; category_slug?: string; tags?: string[] },
  ) =>
    request<{ id: number; updated: boolean }>(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  vote: (id: number | string) =>
    request<{ id: number; votes_count: number; voted: boolean }>(`/questions/${id}/vote`, {
      method: 'POST',
    }),

  save: (id: number | string) =>
    request<{ saved: boolean }>(`/questions/${id}/save`, { method: 'POST' }),

  deleteQuestion: (id: number | string) =>
    request<{ deleted: boolean }>(`/questions/${id}`, { method: 'DELETE' }),

  // Likes y guardados del usuario actual (botones activos al recargar).
  interactions: () => request<{ voted: number[]; saved: number[] }>('/users/me/interactions'),

  // Marca una respuesta como solución aceptada (solo el autor de la pregunta).
  markAnswerAccepted: (
    questionId: number | string,
    answerId: number | string,
    accepted: boolean,
  ) =>
    request<{ id: number; is_accepted: number }>(
      `/questions/${questionId}/answers/${answerId}/accept`,
      { method: 'PATCH', body: JSON.stringify({ accepted }) },
    ),

  me: () => request<User>('/users/me'),

  myQuestions: () => request<MyQuestionsResponse>('/users/me/questions'),

  myActivity: () =>
    request<{ type: string; text: string; created_at: string; ref_id: number }[]>(
      '/users/me/activity',
    ),

  experts: () =>
    request<
      (User & { accepted_count: number })[]
    >('/users/experts'),

  projects: () =>
    request<Project[]>('/projects'),

  project: (id: number | string) =>
    request<Project>(`/projects/${id}`),

  // FormData con los campos del formulario "Compartir Proyecto" más el archivo.
  createProject: (formData: FormData) =>
    request<{ id: number; stack: string[] }>('/projects', {
      method: 'POST',
      body: formData,
    }),
}