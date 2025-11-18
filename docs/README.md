# Documentation Guidelines

This directory contains all documentation for the SosheIQ project. To maintain organization, please adhere to the following filing rules.

## Folder Structure

All markdown files MUST be categorized into one of the following subdirectories. Do not create files in the root of `docs/` unless they are high-level indices or readmes.

- **`architecture/`**: High-level system design, diagrams, and decision records (ADRs).
    - *Examples*: `ARCHITECTURE_DIAGRAM.md`, `database-schema.md`
- **`guides/`**: How-to guides, tutorials, and setup instructions for developers.
    - *Examples*: `setup-guide.md`, `deployment.md`
- **`api/`**: API documentation, interface definitions, and contract specs.
    - *Examples*: `api-endpoints.md`, `types-reference.md`
- **`plans/`**: Implementation plans, roadmaps, and feature specs.
    - *Examples*: `v1-roadmap.md`, `auth-feature-plan.md`
- **`meeting-notes/`**: Notes from team meetings, standups, or planning sessions.
- **`logs/`**: Automated logs or run reports (if checked in).
- **`analysis-results/`**: Output from analysis tools.

## Filing Rules

1.  **No Loose Files**: Avoid placing `.md` files directly in `docs/`. Move them to the appropriate subdirectory.
2.  **Naming Convention**: Use `kebab-case` for filenames (e.g., `user-auth-flow.md`).
3.  **Images**: Store images in a local `assets/` folder within the specific subdirectory (e.g., `docs/architecture/assets/diagram.png`).
4.  **Links**: Use relative links to reference other documents.

## Migration

If you find a file in the wrong place, please move it and update any links pointing to it.
