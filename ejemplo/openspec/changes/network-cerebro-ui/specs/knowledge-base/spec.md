## ADDED Requirements

### Requirement: Knowledge base displays curated technical articles
The system SHALL provide a dedicated Knowledge Base section with curated articles, resolved solutions, and best practices.

#### Scenario: User navigates to Knowledge Base
- **WHEN** a user clicks "Base de Conocimiento" in the sidebar
- **THEN** the system displays a list of knowledge base articles sorted by most recently updated

### Requirement: Category filters for knowledge base
The system SHALL allow users to filter knowledge base articles by technical category (e.g., Redes, Sistemas de Cobro, Desarrollo).

#### Scenario: User filters by category
- **WHEN** a user selects a category filter
- **THEN** the knowledge base list shows only articles in that category

### Requirement: Article detail view
The system SHALL display a full article view with rich content, formatted code blocks, and related links.

#### Scenario: User opens an article
- **WHEN** a user clicks on a knowledge base article
- **THEN** the system displays the full article with all content, code blocks, and related links

### Requirement: Promote resolved thread to knowledge base article
The system SHALL allow moderators to promote a resolved thread to a knowledge base article.

#### Scenario: Moderator promotes a thread
- **WHEN** a moderator marks a thread for knowledge base promotion
- **THEN** the thread content becomes a knowledge base article available in the Knowledge Base section