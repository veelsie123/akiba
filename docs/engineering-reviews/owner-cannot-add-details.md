Title: Owner report — "Can't add new details" (quick diagnosis)

Summary
-------
Owner reported that she "can't add new details in either of the three users dashboards." Investigated the staff, clients, and appointments dashboards and API routes to reproduce and diagnose.

Reproduction (how it manifests)
-------------------------------
- On dashboard pages (Dashboard → Staff, Clients, Appointments) the forms submit but return 403/Unauthorized for non-ADMIN users.
- Staff creation (POST /api/users) only succeeds for ADMIN users.
- Client creation (POST /api/clients) only allows ADMIN or LAWYER.
- Appointments creation requires ADMIN, LAWYER, or RECEPTIONIST (recent change added). Depending on the user's role, create/update may be blocked by server-side RBAC.

Root cause
----------
Recent security hardening added explicit role checks in API routes. This is correct for production but changes behavior: receptionists and other non-admin roles that previously could create or edit certain records are now forbidden by server-side checks.

Files touched in this investigation and recent edits
--------------------------------------------------
- app/dashboard/staff/page.tsx (UI form)
- app/dashboard/clients/page.tsx (UI form)
- app/dashboard/appointments/page.tsx (UI form)
- app/api/users/route.ts (server: previously allowed POST only for ADMIN)
- app/api/clients/route.ts (server: now requires ADMIN|LAWYER to POST)
- app/api/cases/route.ts and app/api/cases/[id]/route.ts (added ADMIN|LAWYER checks)
- app/api/appointments/route.ts (added ADMIN|LAWYER|RECEPTIONIST checks)
- lib/supabase/server.ts (service-key-only enforcement)
- lib/requireRole.ts (new helper)

Immediate recommendation
-----------------------
1. Confirm intended role model with the owner: which roles should be allowed to create/modify Staff, Clients, Appointments, and Cases?
2. For now, updated server-side checks to make the app usable during demos/presentations:
   - Clients: ADMIN | LAWYER | RECEPTIONIST can create clients
   - Appointments: ADMIN | LAWYER | RECEPTIONIST can create appointments (already applied)
   - Staff (users): creation remains ADMIN-only; users can now update their own profile; ADMIN retains full management rights
   - Cases: ADMIN | LAWYER can create/update/delete cases
3. Add a short acceptance test or CI check to ensure these role behaviors are preserved.

Actions taken
-------------
- Modified app/api/clients/route.ts to allow RECEPTIONIST to create clients.
- Modified app/api/users/[id]/route.ts to allow a user to GET/PUT their own profile in addition to ADMIN.
- Modified app/api/cases/* and app/api/appointments/* to enforce role checks for relevant actions.
- Updated lib/supabase/server.ts to require SUPABASE_SERVICE_ROLE_KEY only and added DEMO_MODE guard to login UI.

Suggested next steps (I can do any/all of these):
- Add explicit role-permissions documentation in docs/ (I can create a concise POLICY.md)
- Add basic tests that check create/update permissions for ADMIN, LAWYER, RECEPTIONIST, and regular users
- Open a PR with these changes and a short changelog for the owner

If anything above should be different for your presentation, say which resource (Staff/Clients/Appointments/Cases) and which role should be allowed to perform create/update actions.
