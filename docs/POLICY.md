# Access Control & Role Permissions Policy (RBAC)

## Overview
Akiba Law Firm Management system implements Role-Based Access Control (RBAC) across server API routes and UI dashboards.

## User Roles
- **ADMIN**: System Administrators & Firm Partners (full access to all resources)
- **LAWYER**: Attorneys & Legal Staff
- **RECEPTIONIST**: Front Desk & Client Intake Specialists

---

## Role Permissions Matrix

| Resource | Action | ADMIN | LAWYER | RECEPTIONIST | Self (User) |
|---|---|:---:|:---:|:---:|:---:|
| **Staff / Users** (`/api/users`) | View List (GET) | ✅ | ✅ | ✅ | — |
| | Create Staff (POST) | ✅ | ❌ | ❌ | — |
| | View Profile (GET `/[id]`) | ✅ | ❌ | ❌ | ✅ (Own profile) |
| | Update Profile (PUT `/[id]`) | ✅ | ❌ | ❌ | ✅ (Own profile) |
| | Delete Staff (DELETE `/[id]`) | ✅ | ❌ | ❌ | ❌ |
| **Clients** (`/api/clients`) | View Clients (GET) | ✅ | ✅ | ✅ | — |
| | Create Client (POST) | ✅ | ✅ | ✅ | — |
| | Update Client (PUT `/[id]`) | ✅ | ✅ | ✅ | — |
| | Delete Client (DELETE `/[id]`) | ✅ | ✅ | ❌ | — |
| **Appointments** (`/api/appointments`) | View Appointments (GET) | ✅ | ✅ | ✅ | — |
| | Create Appointment (POST) | ✅ | ✅ | ✅ | — |
| | Update Appointment (PUT `/[id]`) | ✅ | ✅ | ✅ | — |
| | Delete Appointment (DELETE `/[id]`) | ✅ | ✅ | ❌ | — |
| **Cases** (`/api/cases`) | View Cases (GET) | ✅ | ✅ | ✅ | — |
| | Create Case (POST) | ✅ | ✅ | ❌ | — |
| | Update Case (PUT `/[id]`) | ✅ | ✅ | ❌ | — |
| | Delete Case (DELETE `/[id]`) | ✅ | ✅ | ❌ | — |

---

## Verification & Key Guardrails
1. **Unauthenticated Requests**: Return `401 Unauthorized`.
2. **Insufficient Privileges**: Return `403 Forbidden`.
3. **Self Profile Updates**: Users are allowed to fetch (`GET`) and update (`PUT`) their own user profile record matching `session.user.id`.
4. **Account Self-Deletion**: Admins cannot delete their own active account.
