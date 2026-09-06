## 1. Project Scaffolding and Design System

- [x] 1.1 Initialize React + TypeScript + Vite project
- [x] 1.2 Install dependencies: React Router v6, Zustand, React Query, Prism.js/highlight.js
- [x] 1.3 Set up CSS custom properties for light and dark theme tokens
- [x] 1.4 Create theme toggle logic with localStorage persistence
- [x] 1.5 Set up CSS Modules build configuration
- [x] 1.6 Create global layout shell: header, left sidebar, main area, right sidebar

## 2. Routing and Navigation

- [x] 2.1 Define route tree with React Router v6 (dashboard, thread, profile, knowledge-base, reusable-modules, search)
- [x] 2.2 Implement left sidebar navigation with active route highlighting
- [x] 2.3 Implement header with theme toggle and user avatar

## 3. Dashboard Feed

- [x] 3.1 Build PostCard component with avatar, name, role, date, category badge, title, excerpt, tags
- [x] 3.2 Build filter tabs component ("Todas", "Sin resolver", "Solucionadas", "Módulos Reutilizables")
- [x] 3.3 Build reusable module badge with GitHub icon on module post cards
- [x] 3.4 Build card footer with response count, votes, and status indicator
- [x] 3.5 Implement smart search bar in feed header
- [x] 3.6 Implement "+ Nueva Pregunta / Compartir Proyecto" button
- [x] 3.7 Implement right sidebar with Expertos Destacados and Accesos Rápidos panels
- [x] 3.8 Implement empty state for feed

## 4. Thread View

- [x] 4.1 Build main question display with full content, attachments, and metadata
- [x] 4.2 Build nested answer tree with indentation and connecting lines
- [x] 4.3 Implement "Solución Aceptada" green badge component
- [x] 4.4 Implement Markdown renderer with syntax-highlighted code blocks
- [x] 4.5 Implement file attachment display with download links
- [x] 4.6 Implement full user profile card on each answer
- [x] 4.7 Implement "Tickets relacionados" panel for Assis Now links

## 5. User Profiles

- [x] 5.1 Build profile page with photo, name, role, expertise tags
- [x] 5.2 Build contribution stats section (questions, answers, solutions)
- [x] 5.3 Build activity history timeline with pagination

## 6. Knowledge Base

- [x] 6.1 Build knowledge base article list with category filters
- [x] 6.2 Build article detail view with rich content rendering
- [x] 6.3 Implement promote-thread-to-article flow for moderators

## 7. Reusable Modules

- [x] 7.1 Build reusable module list with GitHub-linked cards
- [x] 7.2 Build module creation form with repository URL, description, and tags
- [x] 7.3 Implement download/clone counter display

## 8. Search

- [x] 8.1 Implement search query flow from dashboard search bar
- [x] 8.2 Build search results page with content snippets and type badges
- [x] 8.3 Implement tag and content type filters on search results
- [x] 8.4 Build "No results" empty state with suggestions

## 9. Assis Now Integration

- [x] 9.1 Build quick access widget in right sidebar linking to Assis Now
- [x] 9.2 Build related tickets panel on thread page
- [x] 9.3 Implement ticket linking form (enter ticket ID)
- [x] 9.4 Implement graceful degradation when Assis Now API is unavailable

## 10. Post Creation

- [x] 10.1 Build new question form with title, content, category, tags, and file attachments
- [x] 10.2 Build new reusable module form with repository URL option
- [x] 10.3 Implement form validation and submission UX