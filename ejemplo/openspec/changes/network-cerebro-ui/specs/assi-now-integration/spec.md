## ADDED Requirements

### Requirement: Assis Now quick access widget in sidebar
The system SHALL display a "Accesos Rápidos" widget in the right sidebar with a link to open Assis Now and create new tickets.

#### Scenario: User opens Assis Now from widget
- **WHEN** a user clicks the Assis Now link in the quick access widget
- **THEN** the system opens Assis Now in a new tab or embedded panel

### Requirement: Related tickets panel on thread page
The system SHALL display a panel on the thread detail page showing related Assis Now tickets linked to that thread.

#### Scenario: User views related tickets
- **WHEN** a user opens a thread that has linked Assis Now tickets
- **THEN** the system displays a "Tickets relacionados" panel showing ticket IDs, status, and summary

### Requirement: Link a thread to an Assis Now ticket
The system SHALL allow users to link a thread to an existing Assis Now ticket by entering the ticket ID.

#### Scenario: User links ticket
- **WHEN** a user adds an Assis Now ticket ID to a thread
- **THEN** the system validates the ticket ID and displays it in the related tickets panel

### Requirement: Bi-directional reference
When a thread is linked to an Assis Now ticket, the system SHALL display a reference back to the thread within the Assis Now ticket (via API).

#### Scenario: Bi-directional link created
- **WHEN** a thread is linked to an Assis Now ticket successfully
- **THEN** the system displays a reference note in the thread: "Ticket ASSIS-1234 está vinculado a este hilo"