# Builder Shell

The dnd-kit canvas: drag/drop orchestration, block selection, nested-component/column layout, resize,
keyboard shortcuts (copy/paste/undo/redo). Implements the undo/redo command stack used uniformly across
add/move/delete/property-edit operations. Renders blocks from `blocks/` but is itself block-agnostic —
it only knows the registry contract from `packages/block-contracts`.
