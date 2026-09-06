## ADDED Requirements

### Requirement: Thread page shows the main question at the top
The system SHALL display the original question post at the top of the thread page with full content, attachments, and metadata.

#### Scenario: User views a thread
- **WHEN** a user clicks on a post in the feed
- **THEN** the system displays the thread page with the original question at the top

### Requirement: Nested answers with Reddit-style hierarchy
The system SHALL display answers as nested comments showing parent-child relationships with indentation and connecting lines.

#### Scenario: User views answers
- **WHEN** a thread has multiple answers
- **THEN** answers are displayed in a nested tree with visual indentation

#### Scenario: User replies to an answer
- **WHEN** a user clicks "Responder" on an existing answer
- **THEN** a reply form appears below that answer, and the new reply is nested under it

### Requirement: Accepted solution marker
The system SHALL display a prominent green "Solución Aceptada" badge on the answer marked as the accepted solution.

#### Scenario: User sees accepted solution
- **WHEN** a thread has an accepted solution
- **THEN** the accepted answer shows a green "Solución Aceptada" badge at the top of that answer

### Requirement: Code block formatting with syntax highlighting
The system SHALL render code blocks with syntax highlighting in both questions and answers.

#### Scenario: User posts a code block
- **WHEN** a user includes a code block in their post
- **THEN** the system renders it with syntax highlighting and a copy button

### Requirement: File attachments
The system SHALL allow users to attach files (PDF, images, configuration files) to posts and answers.

#### Scenario: User views attached file
- **WHEN** a post has an attached PDF file
- **THEN** the system displays a file link with filename, size, and download button

### Requirement: Full user profile shown on each response
Every answer SHALL display the responder's full profile: photo, name, role, and expertise tags. No anonymous or pseudonymous answers.

#### Scenario: User views an answer
- **WHEN** an answer is displayed
- **THEN** the responder's full profile information is shown alongside the answer