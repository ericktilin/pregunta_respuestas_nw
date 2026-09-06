## ADDED Requirements

### Requirement: Theme toggle in header
The system SHALL provide a theme toggle button in the application header that switches between light and dark themes.

#### Scenario: User toggles theme
- **WHEN** a user clicks the theme toggle button
- **THEN** the system switches from light to dark (or vice versa) and persists the preference

### Requirement: Theme persistence
The system SHALL persist the user's theme preference across sessions using localStorage.

#### Scenario: Theme persists on reload
- **WHEN** a user selects dark theme and reloads the page
- **THEN** the system applies dark theme without flashing the light theme

### Requirement: All components respect theme tokens
All UI components SHALL use CSS custom properties for colors, so they automatically adapt when the theme changes.

#### Scenario: Theme switch applies to all components
- **WHEN** the theme is switched
- **THEN** all components update to the new theme without visual glitches or missing styles