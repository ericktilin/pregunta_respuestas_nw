## Why

Network Cerebro does not exist yet. The company lacks a centralized internal technical forum and knowledge base where engineers can ask questions, share reusable modules, document solutions, and connect technical discussions with Assis Now support tickets. This leads to duplicated effort, lost knowledge, and slower issue resolution.

## What Changes

- Build a new "Network Cerebro" web application: an internal technical forum + knowledge base
- Implement a Dashboard with smart search, categorized feed, expert panels, and quick-access widgets
- Implement a Detailed Thread View with nested responses, accepted solution markers, and code block formatting
- Add user profiles with roles, expertise tags, and contribution history
- Create a Knowledge Base section for curated technical articles and resolved solutions
- Add a Reusable Modules section for sharing code, configs, and repositories (linked to GitHub)
- Integrate with Assis Now to link forum threads to support tickets
- Support light/dark theme toggle

## Capabilities

### New Capabilities
- `dashboard-feed`: Main landing page with categorized feed, smart search bar, filter tabs (All, Unresolved, Solved, Reusable Modules), and sidebar panels (Expert Spotlight, Quick Access)
- `thread-view`: Detailed question/thread page with nested answers (Reddit-style hierarchy), accepted solution marker, code block formatting, file attachments, and linked Assis Now tickets
- `user-profiles`: User identity with photo, name, role, expertise tags, contribution stats, and activity history
- `knowledge-base`: Curated library of resolved solutions, technical articles, and best practices with search and category filters
- `reusable-modules`: Repository of reusable code snippets, configurations, and project templates with GitHub integration and download links
- `search`: Intelligent full-text search across all content with category and tag filters
- `assi-now-integration`: Widget and thread panel linking related Assis Now tickets, with bi-directional reference between forum posts and support tickets
- `theme-system`: Light and dark theme support with user preference persistence

### Modified Capabilities
<!-- No existing specs to modify; this is a greenfield project. -->

## Impact

- New frontend application (React/TypeScript)
- New backend service or integration layer for search, forum logic, and Assis Now connectivity
- GitHub API integration for reusable module links
- Assis Now API integration for ticket linking
- No existing production systems affected; this is net-new