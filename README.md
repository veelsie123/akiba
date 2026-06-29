# Akiba — Law Firm Management System

A full-stack law firm management system built with Next.js, Supabase, and NextAuth. Three role-based dashboards (Admin, Lawyer, Receptionist) cover the full lifecycle of a law firm: clients, cases, appointments, documents, billing, notifications, and audit logging.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Seeding Demo Data](#seeding-demo-data)
- [Demo Accounts](#demo-accounts)
- [Project Structure](#project-structure)
- [Role Dashboards](#role-dashboards)
- [API Routes](#api-routes)

---

## Features

| Area | Details |
|------|---------|
| Authentication | Email/password login with JWT sessions via NextAuth |
| Role-based access | ADMIN · LAWYER · RECEPTIONIST — each sees their own dashboard and nav items |
| Clients | Create and manage client records; assign to a lawyer |
| Cases | Track case number, type, status (OPEN / PENDING / CLOSED), linked client and lawyer |
| Appointments | Schedule meetings; receptionist sees today's schedule live |
| Documents | Upload document metadata linked to cases and clients |
| Billing | Invoices and line items; track payment status |
| Notifications | Per-user bell with unread badge; full notifications page |
| Audit Log | Admin-only log of every significant action |
| Global Search | Header search across clients, cases, and appointments |

---

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Language** — TypeScript
- **Database** — Supabase (PostgreSQL)
- **Auth** — NextAuth v4 (Credentials provider, JWT strategy)
- **Styling** — Tailwind CSS v4
- **UI Components** — Headless UI, Lucide React icons
- **Animations** — GSAP + @gsap/react
- **Password hashing** — bcryptjs

---

## Prerequisites

- **Node.js** 18 or later — [nodejs.org](https://nodejs.org)
- **npm** (comes with Node) or pnpm / yarn
- **Supabase account** — [supabase.com](https://supabase.com) (free tier is enough)
- **Git**

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd akiba
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local   # if an example file exists, otherwise create it manually
```

Fill in the values — see [Environment Variables](#environment-variables) below.

### 4. Apply the database schema

In your Supabase dashboard go to **SQL Editor** and paste the full contents of [`supabase/schema.sql`](supabase/schema.sql), then run it. This creates all tables, indexes, and the three default user accounts.

### 5. Seed demo data

Start the dev server first, then in a separate terminal (or Postman/curl) call:

```bash
npm run dev
```

```bash
curl -X POST http://localhost:3000/api/seed
```

Or open a browser console on any page and run:

```js
fetch('/api/seed', { method: 'POST' }).then(r => r.json()).then(console.log)
```

You should see a response like:

```json
{
  "success": true,
  "seeded": {
    "users": 3, "clients": 8, "cases": 7,
    "appointments": 6, "documents": 5,
    "auditLogs": 8, "notifications": 4
  }
}
```

> **Re-seeding is safe.** Appointments, documents, audit logs, and notifications are cleared and re-inserted each run. Users, clients, and cases are upserted (no duplicates).

### 6. Open the app

```
http://localhost:3000
```

Log in with one of the [demo accounts](#demo-accounts) below.

---

## Environment Variables

Add these to your `.env.local`. Never commit this file to version control.

```env
# Supabase — from your project's Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<your-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# NextAuth — generate the secret with: openssl rand -hex 32
NEXTAUTH_SECRET=<random-32-byte-hex-string>
NEXTAUTH_URL=http://localhost:3000
```

| Variable | Where to find it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase dashboard → Settings → API → Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Settings → API → Service role key |
| `NEXTAUTH_SECRET` | Run `openssl rand -hex 32` in your terminal |
| `NEXTAUTH_URL` | `http://localhost:3000` for local dev; your production URL when deployed |

> **Keep `SUPABASE_SERVICE_ROLE_KEY` secret.** It bypasses Row Level Security and must never be exposed to the browser or committed to git.

---

## Database Setup

The full schema lives in [`supabase/schema.sql`](supabase/schema.sql). Tables:

| Table | Purpose |
|-------|---------|
| `users` | Staff accounts (admin, lawyers, receptionist) |
| `clients` | Client records, linked to an assigned lawyer |
| `cases` | Legal cases linked to clients and lawyers |
| `appointments` | Scheduled meetings (client + lawyer + optional case) |
| `documents` | Document metadata linked to cases/clients |
| `notifications` | Per-user notifications |
| `invoices` | Billing invoices |
| `invoice_line_items` | Line items for each invoice |
| `payments` | Payment records against invoices |
| `audit_logs` | System-wide action audit trail |

To apply:
1. Go to your Supabase project → **SQL Editor**
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run**

The schema is idempotent (`CREATE TABLE IF NOT EXISTS`) so you can run it multiple times safely. It also inserts the three default user accounts (passwords already hashed).

---

## Seeding Demo Data

`POST /api/seed` populates realistic mock data so every dashboard looks live from the first login.

**What gets seeded:**

- **3 users** — Admin, Lawyer (John Doe), Receptionist (Alice Mwangi)
- **8 clients** — mix of individual and corporate clients
- **7 cases** — 3 OPEN, 2 PENDING, 2 CLOSED — all assigned to John Doe
- **6 appointments** — 3 scheduled for today (receptionist dashboard), 3 upcoming future dates (lawyer dashboard). Dates are always relative to the current time, so re-seeding keeps the dashboards accurate.
- **5 documents** — one per open/pending case
- **8 audit log entries** — spanning the past 7 days
- **4 notifications** — one for each role plus an extra for the lawyer

Seed command (dev server must be running):

```bash
curl -X POST http://localhost:3000/api/seed
```

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@lawfirm.com` | `admin123` |
| Lawyer | `john.doe@lawfirm.com` | `lawyer123` |
| Receptionist | `reception@lawfirm.com` | `reception123` |

These are created by the schema SQL and the seed endpoint. Logging in with each account shows a different dashboard.

---

## Project Structure

```
akiba/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handler + authOptions
│   │   ├── appointments/         # CRUD appointments
│   │   ├── audit/                # Audit log reads
│   │   ├── billing/              # Invoices and payments
│   │   ├── cases/                # Case management
│   │   ├── clients/              # Client management
│   │   ├── documents/            # Document metadata
│   │   ├── notifications/        # GET / POST / PUT notifications
│   │   ├── search/               # Global search across entities
│   │   ├── seed/                 # POST — populate demo data
│   │   └── users/                # Staff management
│   ├── dashboard/
│   │   ├── layout.tsx            # Auth guard + responsive shell
│   │   ├── page.tsx              # Role router → correct dashboard
│   │   ├── appointments/
│   │   ├── audit/
│   │   ├── billing/
│   │   ├── cases/
│   │   ├── clients/
│   │   ├── documents/
│   │   ├── notifications/        # Full notifications page + bell component
│   │   ├── profile/
│   │   ├── reports/
│   │   ├── search/
│   │   └── staff/
│   ├── layout.tsx                # Root layout (SessionProvider, Toaster)
│   └── page.tsx                  # Login page
├── components/
│   ├── dashboard/
│   │   ├── AdminDashboard.tsx
│   │   ├── LawyerDashboard.tsx
│   │   ├── ReceptionistDashboard.tsx
│   │   ├── StatCard.tsx          # Animated metric card (shared)
│   │   └── RecentActivity.tsx    # Animated activity list (shared)
│   └── layout/
│       ├── Header.tsx            # Top bar with search + notifications + user menu
│       └── Sidebar.tsx           # Role-filtered navigation
├── lib/
│   ├── audit.ts                  # Audit logging helpers
│   ├── auth.ts                   # getAuthSession helper
│   └── supabase/
│       ├── server.ts             # Supabase client + throwIfSupabaseError
│       └── types.ts              # Full TypeScript DB schema types
├── supabase/
│   └── schema.sql                # Complete database schema
├── types/
│   └── next-auth.d.ts            # Session/user type augmentations
└── .env.local                    # Your environment variables (not committed)
```

---

## Role Dashboards

### Admin
Sees the full picture of the firm:
- Total users, clients, active cases, and document counts
- Recent audit log (last 5 actions across the system)
- System status panel (Database / Storage / Authentication)
- Navigation to all sections including Staff management and Audit Log

### Lawyer
Sees only their own work:
- Their active case count, closed cases, and upcoming meetings
- A list of their most recent cases with status
- Upcoming appointments with client names and meeting type
- Navigation to Clients, Cases, Appointments, Documents, Billing, and Reports

### Receptionist
Focused on daily front-desk operations:
- Today's appointment count, new clients this week, total clients
- Quick-action buttons — **Add Client** and **Schedule Appointment**
- Today's full schedule with client and assigned lawyer for each slot
- Recently registered clients
- Navigation to Clients, Cases, Appointments, and Documents

---

## API Routes

All routes require an authenticated session (NextAuth JWT) unless noted.

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/notifications` | Current user's notifications + unread count |
| `POST` | `/api/notifications` | Create a notification for a user |
| `PUT` | `/api/notifications` | Mark a notification as read |
| `GET` | `/api/clients` | List all clients |
| `POST` | `/api/clients` | Create a client |
| `GET` | `/api/cases` | List all cases |
| `POST` | `/api/cases` | Create a case |
| `GET` | `/api/cases/[id]` | Single case detail |
| `PUT` | `/api/cases/[id]` | Update a case |
| `DELETE` | `/api/cases/[id]` | Delete a case |
| `GET` | `/api/appointments` | List appointments |
| `POST` | `/api/appointments` | Create an appointment |
| `GET` | `/api/billing` | List invoices |
| `POST` | `/api/billing` | Create an invoice |
| `GET` | `/api/documents` | List documents |
| `POST` | `/api/documents` | Add document metadata |
| `GET` | `/api/search` | Global search (clients, cases, appointments) |
| `GET` | `/api/audit` | Audit log (admin only) |
| `GET` | `/api/users` | List staff |
| `POST` | `/api/users` | Create a staff account |
| `POST` | `/api/seed` | Populate demo data (dev/DEMO_MODE only) |

---

## Scripts

```bash
npm run dev      # Start development server on http://localhost:3000
npm run build    # Production build
npm run start    # Start production server (after build)
npm run lint     # Run ESLint
```
