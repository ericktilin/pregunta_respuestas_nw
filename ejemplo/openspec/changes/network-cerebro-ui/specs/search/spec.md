## ADDED Requirements

### Requirement: Full-text search across all content
The system SHALL provide full-text search across questions, answers, knowledge base articles, and reusable modules.

#### Scenario: User searches from the dashboard
- **WHEN** a user enters a search query in the dashboard search bar
- **THEN** the system returns results from all content types matching the query

### Requirement: Search results page
The system SHALL display search results on a dedicated page with snippets showing matched content.

#### Scenario: Search results display
- **WHEN** search results are returned
- **THEN** the system displays each result with title, content snippet (highlighting the matching terms), content type badge, and author

### Requirement: Category and tag filters on search results
The system SHALL allow users to filter search results by content type and tags.

#### Scenario: User filters search results
- **WHEN** a user applies a tag filter on the search results page
- **THEN** only results with that tag are shown

### Requirement: No results state
The system SHALL display a helpful message when no results match the search query.

#### Scenario: No results found
- **WHEN** a search query returns no results
- **THEN** the system displays "No se encontraron resultados" with suggestions to broaden the search or browse by category