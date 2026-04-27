# Architecture Notes

## Rendering Performance

The task board used to subscribe to the entire `tasks` array in `TaskBoardPage` and then pass freshly derived task arrays down to every column. That meant editing or moving a single task forced the page to rerender and recreated all three column task lists, even when only one column's visible contents changed.

This was fixed by narrowing subscriptions and memoizing leaf UI:

- `TaskBoardPage` now subscribes to lightweight store slices such as task counts, migration state, storage state, and the currently edited task.
- Each `TaskColumn` subscribes to its own filtered task list through a Zustand selector wrapped with `useShallow`, so unchanged columns can skip rerenders when their task references and order stay the same.
- `TaskColumn`, `TaskSortableCard`, `TaskCard`, and `TaskBoardState` are wrapped in `React.memo`, and stable handlers are provided with `useCallback`.

This keeps drag-and-drop and edits localized to the parts of the board that actually changed.
