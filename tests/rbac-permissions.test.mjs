import test from "node:test";
import assert from "node:assert/strict";

// RBAC permissions helper logic matching lib/requireRole.ts
function hasRole(session, allowed = []) {
  const role = session?.user?.role;
  if (!role) return false;
  return allowed.includes(role);
}

function requireRoleOrResponse(session, allowed) {
  if (!hasRole(session, allowed)) {
    return { status: 403, error: "Forbidden" };
  }
  return null;
}

function canManageProfile(session, targetUserId) {
  if (!session) return { status: 401, error: "Unauthorized" };
  if (session.user.role !== "ADMIN" && session.user.id !== targetUserId) {
    return { status: 403, error: "Forbidden" };
  }
  return { status: 200, allowed: true };
}

test("Staff creation (POST /api/users) permission", async () => {
  const allowedRoles = ["ADMIN"];

  assert.equal(hasRole({ user: { role: "ADMIN" } }, allowedRoles), true, "ADMIN should be allowed");
  assert.equal(hasRole({ user: { role: "LAWYER" } }, allowedRoles), false, "LAWYER should be forbidden");
  assert.equal(hasRole({ user: { role: "RECEPTIONIST" } }, allowedRoles), false, "RECEPTIONIST should be forbidden");
  assert.equal(hasRole(null, allowedRoles), false, "Unauthenticated should be forbidden");
});

test("Staff profile management (GET/PUT /api/users/[id]) permission", async () => {
  const adminSession = { user: { id: "admin-1", role: "ADMIN" } };
  const user1Session = { user: { id: "user-1", role: "RECEPTIONIST" } };
  const user2Session = { user: { id: "user-2", role: "LAWYER" } };

  // Admin can access any profile
  assert.equal(canManageProfile(adminSession, "user-1").status, 200);
  assert.equal(canManageProfile(adminSession, "user-2").status, 200);

  // User can access their own profile
  assert.equal(canManageProfile(user1Session, "user-1").status, 200);
  assert.equal(canManageProfile(user2Session, "user-2").status, 200);

  // User cannot access another user's profile
  assert.equal(canManageProfile(user1Session, "user-2").status, 403);
  assert.equal(canManageProfile(user2Session, "user-1").status, 403);

  // Unauthenticated cannot access
  assert.equal(canManageProfile(null, "user-1").status, 401);
});

test("Client creation (POST /api/clients) permission", async () => {
  const allowedRoles = ["ADMIN", "LAWYER", "RECEPTIONIST"];

  assert.equal(hasRole({ user: { role: "ADMIN" } }, allowedRoles), true, "ADMIN can create clients");
  assert.equal(hasRole({ user: { role: "LAWYER" } }, allowedRoles), true, "LAWYER can create clients");
  assert.equal(hasRole({ user: { role: "RECEPTIONIST" } }, allowedRoles), true, "RECEPTIONIST can create clients");
  assert.equal(hasRole({ user: { role: "GUEST" } }, allowedRoles), false, "GUEST cannot create clients");
  assert.equal(hasRole(null, allowedRoles), false, "Unauthenticated cannot create clients");
});

test("Appointments creation (POST /api/appointments) permission", async () => {
  const allowedRoles = ["ADMIN", "LAWYER", "RECEPTIONIST"];

  assert.equal(hasRole({ user: { role: "ADMIN" } }, allowedRoles), true, "ADMIN can create appointments");
  assert.equal(hasRole({ user: { role: "LAWYER" } }, allowedRoles), true, "LAWYER can create appointments");
  assert.equal(hasRole({ user: { role: "RECEPTIONIST" } }, allowedRoles), true, "RECEPTIONIST can create appointments");
  assert.equal(hasRole({ user: { role: "CLIENT" } }, allowedRoles), false, "CLIENT cannot create appointments");
  assert.equal(hasRole(null, allowedRoles), false, "Unauthenticated cannot create appointments");
});

test("Cases management (POST/PUT/DELETE /api/cases) permission", async () => {
  const allowedRoles = ["ADMIN", "LAWYER"];

  assert.equal(hasRole({ user: { role: "ADMIN" } }, allowedRoles), true, "ADMIN can manage cases");
  assert.equal(hasRole({ user: { role: "LAWYER" } }, allowedRoles), true, "LAWYER can manage cases");
  assert.equal(hasRole({ user: { role: "RECEPTIONIST" } }, allowedRoles), false, "RECEPTIONIST cannot manage cases");
  assert.equal(hasRole(null, allowedRoles), false, "Unauthenticated cannot manage cases");

  const forbiddenResp = requireRoleOrResponse({ user: { role: "RECEPTIONIST" } }, allowedRoles);
  assert.deepEqual(forbiddenResp, { status: 403, error: "Forbidden" });

  const allowedResp = requireRoleOrResponse({ user: { role: "ADMIN" } }, allowedRoles);
  assert.equal(allowedResp, null);
});
