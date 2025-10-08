# Copilot Instructions for Spark Template

## Overview
This project is a minimal Spark Template designed for rapid prototyping and extension. The architecture is modular, with a focus on maintainability and clear separation of concerns.

## Key Structure
- **src/components/**: Contains all major UI and logic modules as individual React components. Each file implements a distinct feature (e.g., `AgentMemoryManager`, `ProjectDashboard`).
- **src/**: Entry points (`App.tsx`, `main.tsx`), global styles, and documentation. Most business logic is in `components/`.
- **packages/spark-tools/**: Houses reusable tools and utilities, managed as a separate npm package.
- **theme.json**, **tailwind.config.js**: Project-wide styling and theme configuration.
- **README.md**: High-level project intro, but not technical details.

## Developer Workflows
- **Build**: Use Vite (`vite.config.ts`) for fast local builds. Run with `npm run dev`.
- **Test**: No explicit test setup found; add tests in `src/` or `packages/` as needed.
- **Debug**: Debug via browser devtools; error boundaries in `ErrorFallback.tsx`.
- **Styling**: Use Tailwind CSS classes. Global styles in `src/index.css` and `src/main.css`.

## Patterns & Conventions
- **Component Naming**: Each file in `src/components/` is a self-contained React component, named after its function.
- **Documentation**: Markdown files in `src/` provide specs, audits, and integration guides. Reference these for context on features and requirements.
- **Separation**: Keep business logic in components; avoid monolithic files.
- **Extensibility**: New features should be added as new components in `src/components/`.

## Integration Points
- **External APIs**: Integrate via dedicated components (e.g., `ExternalAPIIntegrator.tsx`).
- **Global State**: Managed per-component; no global state manager detected.
- **Utilities**: Place shared logic in `src/utils/` or `packages/spark-tools/`.

## Examples
- To add a new analytics feature, create `src/components/AdvancedAnalytics.tsx` and follow the pattern of existing components.
- For project-wide settings, update `GlobalProjectSettings.tsx` and `theme.json`.

## Quick Start
1. Run `npm install` to install dependencies.
2. Start development server: `npm run dev`.
3. Add new features as components in `src/components/`.

---
For questions, review the markdown docs in `src/` or ask for examples from existing components.

## Agent Policy (VS Copilot)

- Do not ask the user to push or create PRs manually. The agent must perform git operations itself or clearly state why it is blocked (permissions, CI policy) and await approval.
- Do not instruct the user to manually edit files or run scripts. The agent must apply patches and run commands directly within the workspace.
- Prefer automated changes via repository tools (apply patches, run tests/build) and ensure green gates before proposing merges.
- After each successful merge, the agent must update indicators in the journals per the IKR protocol.
- If a process or permission blocks an operation, report the exact constraint and pause further PR actions until explicitly unblocked.

### Directive: Full PR Push Rights

- АГЕНТ ИМЕЕТ ПОЛНЫЕ ПРАВА ПУШИТЬ PR (ветки и Pull Requests создаются и обновляются агентом программно).
- Agent has full rights to push branches and open/update Pull Requests programmatically.
