## ADDED Requirements

### Requirement: Reusable modules section with GitHub integration
The system SHALL provide a dedicated section for reusable code snippets, configurations, and project templates linked to GitHub repositories.

#### Scenario: User views reusable modules
- **WHEN** a user clicks "Proyectos Reutilizables" in the sidebar
- **THEN** the system displays a list of reusable module posts with repository information

### Requirement: Module card with GitHub link
Each reusable module post SHALL display a card with the module name, description, GitHub repository link, download count, and tags.

#### Scenario: User sees a module card
- **WHEN** a reusable module appears in the list
- **THEN** the card displays the module name, description, GitHub link button, download count, and technology tags

### Requirement: Post a reusable module
The system SHALL allow users to create a new reusable module post with a GitHub repository URL, description, and tags.

#### Scenario: User creates a module post
- **WHEN** a user selects "Compartir Proyecto" from the new post button
- **THEN** the system shows a form with fields for repository URL, module name, description, category, and tags

### Requirement: Module download counter
The system SHALL track how many times a reusable module has been downloaded or cloned.

#### Scenario: User downloads a module
- **WHEN** a user clicks the GitHub link or download button on a module
- **THEN** the system increments the download counter for that module