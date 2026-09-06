## ADDED Requirements

### Requirement: User profile displays identity information
The system SHALL display a user profile page with photo, full name, role (e.g., "Desarrollador Java"), and expertise tags.

#### Scenario: User views own profile
- **WHEN** a user clicks on their own name or avatar
- **THEN** the system displays their profile with photo, name, role, and expertise tags

#### Scenario: User views another user's profile
- **WHEN** a user clicks on another user's name or avatar
- **THEN** the system displays that user's profile with photo, name, role, and expertise tags

### Requirement: Contribution stats on profile
The system SHALL display contribution statistics: total questions asked, total answers given, number of accepted solutions.

#### Scenario: User views contribution stats
- **WHEN** a user's profile is displayed
- **THEN** the system shows stats for questions, answers, and accepted solutions

### Requirement: Activity history on profile
The system SHALL display a chronological list of the user's recent activity (posts, answers, edits).

#### Scenario: User views activity history
- **WHEN** a user scrolls to the activity section of a profile
- **THEN** the system displays a paginated list of recent contributions

### Requirement: Top contributor badge in Expert Spotlight
The system SHALL recognize top contributors and display their profile in the Expert Spotlight panel on the dashboard.

#### Scenario: Expert is featured
- **WHEN** a user qualifies as a top contributor (by accepted solutions or helpful votes)
- **THEN** their profile appears in the Expertos Destacados panel with their expertise areas