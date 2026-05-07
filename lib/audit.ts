export async function logAction(
  action: string,
  entityType: string,
  entityId?: string,
  details?: string
) {
  try {
    await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, entityType, entityId, details }),
    });
  } catch (error) {
    console.error("Failed to log action:", error);
  }
}

// Pre-defined action types for consistency
export const AuditActions = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  VIEW: "VIEW",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  UPLOAD: "UPLOAD",
  DOWNLOAD: "DOWNLOAD",
  PAYMENT: "PAYMENT_RECORDED",
  STATUS_CHANGE: "STATUS_CHANGE",
  ASSIGN: "ASSIGN",
} as const;

// Pre-defined entity types
export const AuditEntityTypes = {
  CLIENT: "CLIENT",
  CASE: "CASE",
  APPOINTMENT: "APPOINTMENT",
  DOCUMENT: "DOCUMENT",
  INVOICE: "INVOICE",
  PAYMENT: "PAYMENT",
  USER: "USER",
  STAFF: "STAFF",
} as const;

export type AuditAction = typeof AuditActions[keyof typeof AuditActions];
export type AuditEntityType = typeof AuditEntityTypes[keyof typeof AuditEntityTypes];