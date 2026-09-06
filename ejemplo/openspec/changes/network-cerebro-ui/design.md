## Context

Network Cerebro is a greenfield internal technical forum and knowledge base for the enterprise intranet. The application serves engineers who need to ask technical questions, share reusable code/configurations, document solutions, and link discussions to Assis Now support tickets. The visual style should be professional, clean, and modern — inspired by Cisco Community and Stack Overflow but adapted for corporate intranet use.

**Constraints:**
- Must run inside the corporate intranet (no public access)
- Must integrate with Assis Now API for ticket linking
- Must integrate with GitHub for reusable module links
- Must support both light and dark themes
- Users are identified by corporate directory (no anonymous posts)
- Content includes code blocks, file attachments, and rich text

## Goals / Non-Goals

**Goals:**
- Define the UI component hierarchy and layout structure for all views
- Define the data flow between components (state management approach)
- Define the route design (URL structure)
- Define the integration points with Assis Now and GitHub APIs
- Define the visual design system (colors, typography, spacing)
- Define the responsive layout strategy

**Non-Goals:**
- Backend API design or database schema
- Authentication/authorization implementation detail
- Deployment pipeline or infrastructure
- Performance benchmarking

## Decisions

### 1. Frontend Framework: React + TypeScript + Vite
**Rationale:** Mature ecosystem, strong typing, fast HMR with Vite. Component-based architecture maps well to the UI requirements (modular cards, nested threads, sidebar panels). Most corporate frontend teams already use React.

### 2. State Management: Zustand + React Query
**Rationale:** React Query handles server state (API fetching, caching, pagination) while Zustand manages UI state (theme, sidebar collapse, filter selections). This avoids Redux boilerplate and keeps the bundle small.

### 3. Routing: React Router v6
**Rationale:** De facto standard for React SPAs. Nested routes map naturally to the layout hierarchy (sidebar persistent across views, detail pages as child routes).

### 4. UI Component Library: Component-level CSS Modules + a minimal utility layer
**Rationale:** Avoids heavy framework lock-in. CSS Modules provide scoped styles. A small set of CSS custom properties (design tokens) for theming ensures light/dark consistency.

### 5. Layout: CSS Grid for page layout, Flexbox for component internals
**Rationale:** CSS Grid handles the three-column dashboard layout naturally. Flexbox manages card internals (avatar + text rows, tag badges, footer actions).

### 6. Content Formatting: Markdown with code syntax highlighting (Prism.js or highlight.js)
**Rationale:** Lightweight, safe (no raw HTML), well-understood by technical users. Code blocks get syntax highlighting automatically.

### 7. Theme System: CSS custom properties toggled via a data-theme attribute on `<html>`
**Rationale:** Zero-runtime approach. All color references use `var(--color-bg)` etc. A single class toggle swaps all values. Persisted in localStorage.

### 8. API Integration Layer: Custom hooks wrapping fetch calls, with React Query caching
**Rationale:** Clean separation: hooks encapsulate API URLs, error handling, and loading states. React Query handles deduplication, caching, and background refetching.

### 9. Assis Now Integration: Embedded widget in sidebar + ticket ID reference in thread posts
**Rationale:** Users see related tickets without leaving the thread. Bi-directional linking enables quick context switching between forum and ticketing system.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **SPA SEO**: No server-side rendering means knowledge base articles may not be indexed by internal search engines | Use pre-rendering or SSR (Next.js) if internal search engine requires crawlable content. For now, rely on the app's own search capability. |
| **Assis Now API availability**: If the ticket system is down, the widget breaks | Graceful degradation: hide the widget section and show a subtle "Service unavailable" message. The forum itself remains fully functional. |
| **Dark theme maintenance**: Keeping 200+ color tokens synchronized across light and dark variants | Use a design token generator. Define colors in a single source file and derive both themes programmatically. |
| **File upload size limits**: Large attachments (PDFs, configs) may hit corporate network limits | Enforce a 10 MB upload limit client-side and server-side. Provide a link to internal file share for larger files. |