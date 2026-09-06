# Akiba — Legal Practice Management System

An all-in-one practice management platform designed for modern law firms, legal clinics, and solo practitioners. Akiba centralizes client onboarding, matter and case lifecycle tracking, appointment scheduling, billing, staff oversight, and audit logging into a secure, role-tailored workspace.

---

## Table of Contents

- [Overview & Value Proposition](#overview--value-proposition)
- [Core Features](#core-features)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Database & Seed Data](#4-database--seed-data)
  - [5. Run Development Server](#5-run-development-server)
- [Demo Credentials](#demo-credentials)
- [Available NPM Scripts](#available-npm-scripts)
- [Project Architecture & Directory Layout](#project-architecture--directory-layout)
- [Documentation & Policies](#documentation--policies)

---

## Overview & Value Proposition

Law firms frequently struggle with fragmented tools: appointments in one calendar, client records in spreadsheets, case updates in emails, and uncoordinated billing. 

**Akiba** solves this by providing:
- **Dedicated Workspaces:** Custom views tailored to partner administrators, attorneys, and front-desk receptionists.
- **Strict Role-Based Security:** Server-side RBAC guards protecting client confidentiality and firm assets.
- **Streamlined Intake to Resolution:** Follow matters from initial consultation booking to case closure and invoicing.
- **Auditability:** Automatic activity and audit logging for regulatory compliance.

---

## Core Features

- **Personalized Dashboards:**
  - **Admin Workspace:** Firm-wide KPI metrics, staff directory, system operational status, and real-time audit logs.
  - **Lawyer Workspace:** Active and closed case assignments, billable hours tracking, and upcoming client hearings/meetings.
  - **Receptionist Workspace:** Front-desk daily schedule, client check-ins, quick intake forms, and attorney calendar coordination.
- **Client Management:** Complete records including personal/corporate info, contact channels, and assigned primary lawyers.
- **Case Lifecycle Tracking:** Matter numbers, case types (Civil, Criminal, Corporate, Family, etc.), court jurisdictions, statuses (`OPEN`, `PENDING`, `CLOSED`), and assigned legal counsel.
- **Appointment Scheduling & Calendar:** Book client consultations, depositions, hearings, and meetings with automatic duration defaults and monthly calendar visualization.
- **Staff & Profile Management:** Admin oversight of attorneys, paralegals, and front desk staff with individual self-service profile updating.
- **Document Management:** Centralized repository for matter-related legal documents and filings.
- **Billing & Invoicing:** Track invoices, payment statuses, and fee breakdowns.
- **Audit Logs:** Track who performed actions (create, edit, delete) on key legal records.

---

## Role-Based Access Control (RBAC)

The platform enforces role checks both at the UI layer and strictly at server-side API routes:

| Resource | Action | Admin | Lawyer | Receptionist | Self (User) |
|---|---|:---:|:---:|:---:|:---:|
| **Staff (`/api/users`)** | View List | ✅ | ✅ | ✅ | — |
| | Create Staff | ✅ | ❌ | ❌ | — |
| | Manage Profile | ✅ | ❌ | ❌ | ✅ (Own profile) |
| | Delete Staff | ✅ | ❌ | ❌ | ❌ |
| **Clients (`/api/clients`)** | View List | ✅ | ✅ | ✅ | — |
| | Create Client | ✅ | ✅ | ✅ | — |
| | Edit / Delete | ✅ | ✅ | ❌ | — |
| **Appointments (`/api/appointments`)** | View & Schedule | ✅ | ✅ | ✅ | — |
| | Edit / Delete | ✅ | ✅ | ❌ | — |
| **Cases (`/api/cases`)** | View Cases | ✅ | ✅ | ✅ | — |
| | Create / Edit / Delete | ✅ | ✅ | ❌ | — |
| **Audit Logs (`/api/audit`)** | View Full Logs | ✅ | ❌ | ❌ | — |

For complete policy specifications, see [`docs/POLICY.md`](docs/POLICY.md).

---

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI & Styling:** [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [GSAP](https://greensock.com/gsap/)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Credentials Provider, JWT Strategy) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Database & Backend:** [Supabase](https://supabase.com/) (PostgreSQL client via `@supabase/supabase-js`)
- **Testing:** Node.js native test runner (`node --test`)

---

## Prerequisites

Before getting started, make sure you have:
1. **Node.js**: `v20.x` or `v24.x` installed ([Download Node.js](https://nodejs.org/)).
2. **npm** (comes with Node.js) or another package manager (pnpm, yarn, bun).
3. **Supabase Account / Project**: A Supabase database instance with API URL and Service Role Key.

---

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/veelsie123/akiba.git
cd akiba
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the provided environment example file to create `.env.local`:

```bash
cp .env.example .env.local
```

Open `.env.local` and configure your credentials:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-generated-secret-key-32-chars-minimum

# Supabase Database Configuration
SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Optional Development Flags
NEXT_PUBLIC_DEMO_MODE=true
BCRYPT_SALT_ROUNDS=6
```

> **Tip:** You can generate a random secret for `NEXTAUTH_SECRET` by running:
> ```bash
> openssl rand -base64 32
> ```

### 4. Database & Seed Data

Ensure your Supabase project contains the expected tables (`users`, `clients`, `cases`, `appointments`, `documents`, `invoices`, `notifications`, and `audit_logs`).

To seed or reseed the demo data locally:

1. Set `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local`.
2. Start the development server:
   ```bash
   npm run dev
   ```
3. In a second terminal, send a `POST` request to the seed endpoint:
   ```powershell
   Invoke-WebRequest `
     -Uri http://localhost:3000/api/seed `
     -Method POST `
     -UseBasicParsing
   ```

You can also use cURL:

```bash
curl -X POST http://localhost:3000/api/seed
```

The endpoint is idempotent for the demo users, clients, cases, and invoices, so it can be run again to restore demo records. A successful request returns `{"success":true}`. Seeding is enabled when `DEMO_MODE=true` or in non-production environments.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Demo Credentials

When running locally or with `NEXT_PUBLIC_DEMO_MODE=true`, you can test different user roles using the seeded accounts:

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **Administrator** | `admin@lawfirm.com` | `admin123` | Full firm management, staff administration, audit logs |
| **Lawyer** | `john.doe@lawfirm.com` | `lawyer123` | Case management, client records, appointment scheduling |
| **Receptionist** | `reception@lawfirm.com` | `reception123` | Client intake, calendar booking, receptionist schedule |

---

## Available NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the Next.js development server with Turbopack |
| `npm run build` | Compiles the production build and runs TypeScript verification |
| `npm start` | Boots the compiled Next.js production server |
| `npm test` | Runs the automated RBAC permissions test suite via Node test runner |
| `npm run lint` | Runs ESLint syntax and code quality checks |

---

## Project Architecture & Directory Layout

```text
akiba/
├── app/
│   ├── api/                     # Server-side API route handlers (RBAC enforced)
│   │   ├── appointments/        # Appointment booking & calendar endpoints
│   │   ├── auth/[...nextauth]/  # NextAuth credentials & JWT handlers
│   │   ├── cases/               # Legal matter CRUD
│   │   ├── clients/             # Client roster & contact info
│   │   ├── dashboard/           # Aggregated statistics & recent activity
│   │   ├── seed/                # Demo data seeder
│   │   └── users/               # Staff administration & profiles
│   ├── dashboard/               # Protected dashboard route group
│   │   ├── appointments/        # Booking forms & calendar views
│   │   ├── audit/               # Admin audit log explorer
│   │   ├── billing/             # Invoices & billing overview
│   │   ├── cases/               # Legal case rosters & management
│   │   ├── clients/             # Client list & intake forms
│   │   ├── profile/             # Self-service user profile view/edit
│   │   └── staff/               # Firm staff management (Admin-only)
│   ├── layout.tsx               # Root application layout
│   └── page.tsx                 # Login portal
├── components/
│   ├── dashboard/               # Role-specific dashboard widgets (Admin, Lawyer, Receptionist)
│   └── layout/                  # Sidebar navigation, top header, user menu
├── docs/                        # Architecture & engineering review documentation
│   ├── POLICY.md                # Formal RBAC access control policy matrix
│   └── engineering-reviews/     # Incident reports and engineering mitigations
├── lib/
│   ├── requireRole.ts           # Role checking & forbidden response helper
│   └── supabase/server.ts       # Server-only Supabase client with service role key
└── tests/
    └── rbac-permissions.test.mjs # Automated RBAC permission unit tests
```

---

## Documentation & Policies

- **Access Control & RBAC Matrix:** Refer to [`docs/POLICY.md`](docs/POLICY.md) for endpoint authorization specifications.
- **Engineering Reviews:** See [`docs/engineering-reviews/owner-cannot-add-details.md`](docs/engineering-reviews/owner-cannot-add-details.md) for recent fixes and role model decisions.
