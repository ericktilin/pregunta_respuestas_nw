## ADDED Requirements

### Requirement: Dashboard displays categorized feed of posts
The system SHALL display a central feed of technical questions, knowledge base articles, and reusable module posts on the main dashboard page. The feed SHALL be paginated with infinite scroll or numbered pages.

#### Scenario: User views the main feed
- **WHEN** a user navigates to the dashboard
- **THEN** the system displays a feed of recent posts sorted by most recent activity
- **AND** each post card shows the author avatar, name, role, date, category badge, title, excerpt, tags, response count, vote count, and status

#### Scenario: Feed is empty
- **WHEN** no posts exist in the system
- **THEN** the system displays an empty state message: "No hay publicaciones aún. ¡Sé el primero en compartir!"

### Requirement: Smart search bar in dashboard header
The system SHALL provide a prominent search bar at the top of the central area with placeholder text "Busca soluciones, configuraciones de router, sistemas de cobro..."

#### Scenario: User performs a search
- **WHEN** a user types in the search bar and presses Enter
- **THEN** the system navigates to the search results page showing matching posts from all content types

### Requirement: Filter tabs for feed content
The system SHALL provide filter tabs above the feed: "Todas", "Sin resolver", "Solucionadas", "Módulos Reutilizables".

#### Scenario: User filters by status
- **WHEN** a user clicks "Sin resolver"
- **THEN** the feed filters to show only posts with status "En Proceso"

#### Scenario: User filters by content type
- **WHEN** a user clicks "Módulos Reutilizables"
- **THEN** the feed filters to show only reusable module posts

### Requirement: New post button
The system SHALL display a prominent "+ Nueva Pregunta / Compartir Proyecto" button above the feed.

#### Scenario: User clicks new post button
- **WHEN** a user clicks the new post button
- **THEN** the system navigates to a post creation form

### Requirement: Left sidebar navigation menu
The system SHALL display a left sidebar with navigation items: Inicio, Categorías Técnicas, Mis Preguntas, Base de Conocimiento, Proyectos Reutilizables.

#### Scenario: User navigates via sidebar
- **WHEN** a user clicks "Base de Conocimiento" in the sidebar
- **THEN** the system navigates to the knowledge base view

### Requirement: Right sidebar with Expert Spotlight and Quick Access panels
The system SHALL display a right sidebar with an "Expertos Destacados" panel showing top contributors and a "Accesos Rápidos" panel with a link to Assis Now.

#### Scenario: User views right sidebar
- **WHEN** the dashboard loads
- **THEN** the right sidebar displays the Expertos Destacados and Accesos Rápidos panels

### Requirement: Post card with reusable module indicator
When a post is a reusable module, the card SHALL display a special "Código/Módulo Reutilizable" badge with a GitHub icon.

#### Scenario: Reusable module card renders
- **WHEN** a reusable module post appears in the feed
- **THEN** the card displays the reusable module badge with a GitHub icon link