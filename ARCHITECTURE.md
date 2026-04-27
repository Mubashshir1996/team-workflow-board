# Architecture

## Component Hierarchy

The application is organized around one primary route and one primary feature:

1. `App`
   Wraps the application in `ToastProvider`.
2. `AppRouterProvider`
   Provides the browser router.
3. `TaskBoardPage`
   Owns board-level state such as the current filters, modal visibility, drag-and-drop wiring, migration toast behavior, and empty/error states.
4. `TaskColumn`
   Renders one board lane and subscribes to the lane-specific task slice from the store.
5. `TaskSortableCard`
   Bridges a task card into `@dnd-kit/sortable`.
6. `TaskCard`
   Displays the task title, assignee, tags, priority, and edit affordance.
7. `TaskFormModal`
   Handles task creation and editing with React Hook Form and Zod validation.
8. `TaskBoardState`
   Shared presentation component for empty, filtered-empty, and warning states.

Shared UI primitives such as `Button`, `Input`, `Select`, `Modal`, `Toast`, and `PageShell` live under `src/components/ui`.

## State and Data Flow

- Task entities live in `useTaskStore`.
- The store exposes actions for add, update, delete, move, and initial load.
- Read-heavy UI uses selectors such as `selectTaskCount`, `selectStorageStatus`, and `selectTaskById`.
- Filter state is derived from `URLSearchParams` instead of the store so it can be refreshed and shared.
- `TaskBoardPage` computes per-column selectors from the current filters and passes them to each column.

This keeps the source of truth simple:

- Task content: Zustand store
- Persistence: `localStorage`
- View filters: URL query string
- Form validation state: React Hook Form

## Storage Migration Strategy

Task persistence is versioned with `TASKS_SCHEMA_VERSION`.

### Current versions

- `v1`: stored `id`, `title`, optional `description`, optional `assignee`, and `status`
- `v2`: stores the full task model including `priority`, `tags`, `createdAt`, and `updatedAt`

### Load behavior

1. Attempt to access `localStorage`.
2. If storage is unavailable, return an empty result with `storageStatus: 'unavailable'`.
3. If no payload exists, return an empty result with the current schema version.
4. If the payload is malformed, return `migrationStatus: 'invalid'`.
5. If the payload is already `v2`, normalize values and load as-is.
6. If the payload is `v1`, convert each task to `v2`, save the upgraded payload, and return `migrationStatus: 'migrated'`.

### Why this approach

- The migration is deterministic and local to the storage module.
- The store does not need schema-specific branching.
- The page can surface a success toast when migration happens.
- Invalid or blocked storage does not crash the board.

## Refactor Example

One concrete refactor in this codebase addressed unnecessary rerenders in the task board.

### Before

- `TaskBoardPage` subscribed to the entire `tasks` array.
- The page filtered and regrouped tasks on every board update.
- Fresh arrays were passed to every `TaskColumn`.
- Editing or moving one task could rerender the whole board tree.

### After

- `TaskBoardPage` now subscribes to smaller store slices such as task count, migration metadata, storage status, and the currently edited task.
- Each `TaskColumn` subscribes to its own filtered task list through a selector.
- `useShallow`, `useMemo`, `useCallback`, and `React.memo` are used where they reduce repeated work or prop churn.
- `TaskColumn`, `TaskSortableCard`, `TaskCard`, and `TaskBoardState` are memoized.

### Result

Board updates are more localized, especially when moving tasks between columns or editing a single task.

## Validation and UX Notes

- Zod defines the task form schema.
- React Hook Form manages field registration, submission, dirty state, and error collection.
- The modal warns on unsaved changes through `useBlocker` and `useBeforeUnload`.
- Validation errors are shown both inline and in a summary banner.
- The board exposes polished fallback states for:
  - no tasks
  - no filter matches
  - unavailable storage
  - storage migration success

## Testing Approach

The project currently mixes unit and integration-style tests:

- storage tests for migration and persistence behaviors
- Zustand store tests for task actions
- RTL board tests that cover realistic create, filter, and move flows

This balance keeps critical behavior covered without introducing a large testing harness.

## Future Improvements

- Move filter-derived selectors into reusable selector factories to avoid repeated `applyTaskFiltersAndSort` work across columns.
- Add keyboard-accessible task movement beyond drag-and-drop defaults and edit flows.
- Introduce task deletion and confirmation coverage at the page level.
- Add optimistic analytics or instrumentation hooks around task lifecycle events.
- Consider extracting a dedicated repository layer if persistence moves beyond `localStorage`.
- Improve modal accessibility by removing the need for hidden-aware test queries around the current overlay structure.
