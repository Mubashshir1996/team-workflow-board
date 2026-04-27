# Team Workflow Board

A lightweight kanban-style task board built with React, TypeScript, Vite, Zustand, React Router, and Tailwind CSS. The app supports task creation, filtering, drag-and-drop movement between columns, local persistence, schema migration, and UI feedback for storage and validation states.

## Setup

### Prerequisites

- Node.js 20+ recommended
- npm 10+ recommended

### Install and run

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the local URL printed by Vite, usually `http://localhost:5173`.

## Scripts

- `npm run dev`: start the Vite development server
- `npm run build`: type-check and build the production bundle
- `npm run preview`: preview the built app locally
- `npm run typecheck`: run TypeScript project checks
- `npm run lint`: run ESLint with zero warnings allowed
- `npm run test`: run the Vitest suite once
- `npm run test:watch`: run Vitest in watch mode
- `npm run coverage`: generate test coverage with Vitest
- `npm run format`: format the repository with Prettier
- `npm run format:check`: verify formatting without changing files

## Architecture Overview

The app is intentionally small and centered around a single feature slice:

- `src/app`: app shell and router setup
- `src/components/ui`: shared UI primitives such as buttons, modal, inputs, toast, and page shell
- `src/features/tasks`: board page, task cards, columns, filters, form schema, storage helpers, and feature tests
- `src/store`: Zustand stores and selectors
- `src/types`: shared task types
- `src/test`: Vitest setup

At runtime the flow is:

1. `App` wraps the router in `ToastProvider`.
2. `TaskBoardPage` loads tasks from storage through `useTaskStore`.
3. Task creation and editing happen in `TaskFormModal`.
4. Filter state is kept in the URL query string.
5. Persisted tasks are read from and written to `localStorage`.

See [ARCHITECTURE.md](/d:/Interview/team-workflow-board/ARCHITECTURE.md:1) for deeper implementation notes.

## Key Decisions

- Zustand is used for task state because the app needs simple global state with explicit selectors and low ceremony.
- `localStorage` is used for persistence to keep the app fully client-side and easy to run without backend setup.
- Task filters live in URL search params so filtered views are shareable and survive refreshes.
- Zod and React Hook Form handle validation to keep form logic declarative and accessible.
- Storage loading includes schema migration so existing users are not broken by shape changes.
- Performance-sensitive board rendering uses selectors, `React.memo`, and stable callbacks to avoid broad rerenders.

## AI Usage Disclosure

This project includes AI-assisted work.

- AI was used to help implement UI states, performance improvements, automated tests, and project documentation.
- All generated changes were reviewed, edited, and validated in the codebase with linting, type-checking, and tests.
- AI assistance should be treated as a productivity aid, not as a substitute for engineering review.
