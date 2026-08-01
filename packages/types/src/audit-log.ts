import type { Id } from './common';

export type AuditEntityType = 'template' | 'asset' | 'folder' | 'variable' | 'user' | 'role' | 'plugin';

export type AuditAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'published'
  | 'archived'
  | 'restored'
  | 'rolledBack';

/** Written exclusively by the Audit module's domain-event subscriber — no other module
 * writes here directly. See docs/architecture/01-system-architecture.md §7. */
export interface AuditLog {
  id: Id;
  entityType: AuditEntityType;
  entityId: Id;
  action: AuditAction;
  actorId: Id;
  metadata: Record<string, unknown>;
  createdAt: string;
}
