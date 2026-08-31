# Akiba code review and mitigation plan

## Executive summary

The project has a strong front-end structure and clear domain separation for a legal operations dashboard, but it is not production-safe yet. The biggest gaps are around authentication, authorization, secret management, and test coverage. The app reads like a polished demo/prototype rather than a hardened application that should be exposed to staff or client data.

## Key irregularities and risks

### 1) Demo credentials are exposed in the UI

Evidence:
- `app/page.tsx` explicitly prints live-looking demo credentials for Admin, Lawyer, and Receptionist.
- `app/api/auth/[...nextauth]/route.ts` signs in against a real user table and accepts any matching email/password pair.

Why this matters:
- Anyone visiting the login screen can immediately learn valid staff credentials.
- In a real environment, this creates a high-risk credential leak and undermines access control.
- It also makes it easy for demo credentials to be accidentally reused in production.

Mitigation:
- Remove credential hints from production UI.
- Keep seed/demo accounts behind a clearly guarded `DEMO_MODE` flag that is disabled in all non-local environments.
- Replace “demo credentials” with a secure onboarding or invitation flow.

### 2) Authorization checks are incomplete and inconsistent

Evidence:
- `app/api/clients/route.ts` only checks `if (!session)` and then allows insertion of any client record.
- `app/api/cases/route.ts` does the same pattern for case creation.
- `app/api/appointments/route.ts` only verifies login and entity existence before inserting rows.
- `app/api/users/route.ts` gives staff creation access only to `ADMIN`, but the wider endpoint pattern still allows broad access to any authenticated user unless the route itself enforces further checks.

Why this matters:
- The middleware around `proxy.ts` enforces some path-based rules, but the API routes themselves are the real security boundary and they are not enforcing role or ownership checks consistently.
- A lawyer or receptionist with any valid session can read or create data that should be restricted to admins or specific roles.
- This is a classic authorization gap: authentication exists, but authorization is only partially implemented.

Mitigation:
- Add a centralized role helper such as `requireRole(session, ["ADMIN", "LAWYER"])` and call it in every route.
- Enforce record-level ownership checks before `insert`, `update`, or `delete` actions.
- Apply database-level Row Level Security (RLS) in Supabase so the API cannot bypass business rules.
- Restrict sensitive endpoints to admin-only or per-role access in a single policy layer.

### 3) Secret handling is fragile and may silently degrade security

Evidence:
- `lib/supabase/server.ts` does this:
  - prefers `SUPABASE_SERVICE_ROLE_KEY`
  - but falls back to `SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Why this matters:
- A server-side module should fail fast on missing secrets, not silently use a public key.
- Falling back to anonymous keys risks accidental exposure of unrestricted server-side database operations or incorrect RLS assumptions.
- This configuration can easily turn a demo environment into a production misconfiguration without an obvious crash.

Mitigation:
- Remove all anonymous-key fallbacks from server-only Supabase bootstrap.
- Throw an explicit startup error if `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing.
- Keep public key usage only in client-safe code paths, never in server-only code.
- Add a `.env.example` and deployment validation step to fail builds when required env vars are missing.

### 4) The app is missing a real test safety net

Evidence:
- No test files were found under the repository matching `*.test.*` or `*.spec.*` patterns.
- The repo exposes a lint script, but there is no automated coverage for auth, RBAC, or CRUD flows.

Why this matters:
- Route handlers are trusting request JSON without a consistent contract at every boundary.
- Authorization regressions and data integrity issues can slip in silently.
- Security fixes need regression tests to stay protected over time.

Mitigation:
- Add unit tests for auth helpers, route guards, and Zod validation.
- Add integration tests for admin/lawyer/receptionist access conditions.
- Add a CI gate requiring `lint`, `typecheck`, and a focused test suite before merge.

### 5) Excessive debug logging and low observability in production paths

Evidence:
- `app/api/users/route.ts` logs staff creation
- `app/api/appointments/route.ts` logs request bodies and processed appointment JSON
- `app/api/cases/route.ts` logs case updates
- Many pages log client-side diagnostics and fetch responses

Why this matters:
- Raw request payloads and internal identifiers can leak into logs.
- Operational noise makes it harder to trace real failures or abuse.
- This is especially risky when handling sensitive legal and client data.

Mitigation:
- Replace `console.log` with structured logging gated to non-production environments.
- Redact sensitive fields before logging.
- Add request IDs and correlation fields to audit or logging output.

### 6) Server and client boundaries are not consistently modeled

Evidence:
- `app/page.tsx` is a client component that calls `signIn` and pushes routes.
- `app/dashboard/layout.tsx` uses `useSession` and redirect logic on the client.
- `app/api/auth/[...nextauth]/route.ts` uses server session callbacks and directly queries Supabase.

Why this matters:
- The project mixes interactive client auth patterns with server-side auth logic in several places.
- This increases the chance of mismatched assumptions about who is allowed to do what.
- It is harder to reason about security when the enforcement is split across client redirects, middleware, and API handlers.

Mitigation:
- Put policy checks in one central server layer and keep client code purely presentational.
- Use server components or route handlers that already know the user session rather than re-deriving auth in the browser.
- Avoid trusting client-side route checks as security enforcement.

## Positive patterns found

- The app has a clear, well-named structure for legal-domain features (`clients`, `cases`, `appointments`, `billing`, `documents`).
- Zod validation is used in several API routes, which is a good foundation for stricter schema enforcement.
- `next-auth` is being used consistently for session handling, and the app separates admin / lawyer / receptionist dashboard views by role.
- The UI styling and navigation are coherent and readable, which helps maintainability.

## Recommended mitigation roadmap

### Priority 0: Security hardening
1. Remove demo credentials from the login page and seed flows.
2. Add a single centralized RBAC helper and enforce it in all protected routes.
3. Move authorization policy into Supabase RLS and route-specific ownership rules.
4. Fail fast on missing service-role secrets and remove anonymous-key fallbacks.

### Priority 1: Production quality
1. Convert debug logs to structured, redacted logs.
2. Add audit trails for create/update/delete actions on clients, cases, appointments, users, and billing.
3. Add validation around date ranges, role assignment, and ID ownership checks.
4. Add rate limiting and request-size checks for public endpoints.

### Priority 2: Reliability and maintainability
1. Add test coverage for authentication and authorization.
2. Add a small CI pipeline (`lint`, `typecheck`, targeted tests).
3. Introduce request/response DTO types for each major resource.
4. Replace repeated route-specific logic with shared service functions.

## Verdict

Request changes before production use. The codebase is visually strong and logically organized, but the current security model is not ready for real legal data or multi-user access. The fastest path to stabilization is to treat the current implementation as a prototype and enforce RBAC, RLS, secret hygiene, and regression tests as the immediate next milestone.
