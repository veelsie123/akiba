import { Session } from "next-auth";

export function hasRole(session: Session | null | undefined, allowed: string[] = []) {
  const role = session?.user?.role;
  if (!role) return false;
  return allowed.includes(role as string);
}

export function requireRoleOrResponse(session: Session | null | undefined, allowed: string[]) {
  if (!hasRole(session, allowed)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null;
}
