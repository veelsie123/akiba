create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password text not null,
  role text not null default 'RECEPTIONIST' check (role in ('ADMIN', 'LAWYER', 'RECEPTIONIST')),
  phone text,
  address text,
  salary numeric,
  age integer,
  "emergencyContact" text,
  "emergencyPhone" text,
  position text,
  "employeeId" text unique,
  "idNumber" text,
  "bankAccount" text,
  "bankName" text,
  "employmentStatus" text not null default 'ACTIVE' check ("employmentStatus" in ('ACTIVE', 'INACTIVE', 'TERMINATED')),
  "employmentType" text not null default 'FULL_TIME' check ("employmentType" in ('FULL_TIME', 'PART_TIME', 'CONTRACT')),
  "hireDate" timestamptz,
  "dateOfBirth" timestamptz,
  "terminationDate" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text not null,
  address text not null,
  company text,
  notes text,
  "lawyerId" uuid references public.users(id) on delete set null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  "caseNumber" text not null unique,
  title text not null,
  description text,
  status text not null default 'OPEN' check (status in ('OPEN', 'PENDING', 'CLOSED')),
  type text not null,
  court text,
  "clientId" uuid not null references public.clients(id) on delete cascade,
  "lawyerId" uuid references public.users(id) on delete set null,
  "closingDate" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  "startTime" timestamptz not null,
  "endTime" timestamptz not null,
  type text not null,
  status text not null default 'SCHEDULED' check (status in ('SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
  "clientId" uuid not null references public.clients(id) on delete cascade,
  "lawyerId" uuid not null references public.users(id) on delete cascade,
  "caseId" uuid references public.cases(id) on delete set null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  size bigint not null,
  url text not null,
  description text,
  "caseId" uuid references public.cases(id) on delete set null,
  "clientId" uuid references public.clients(id) on delete set null,
  "uploadedById" uuid not null references public.users(id) on delete cascade,
  "uploadedAt" timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text not null,
  "userId" uuid not null references public.users(id) on delete cascade,
  read boolean not null default false,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  "invoiceNumber" text not null unique,
  "clientId" uuid not null references public.clients(id) on delete cascade,
  "caseId" uuid references public.cases(id) on delete set null,
  "dueDate" date,
  description text,
  subtotal numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null default 0,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOID')),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  "invoiceId" uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric not null default 1,
  rate numeric not null default 0,
  amount numeric not null default 0,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  "invoiceId" uuid not null references public.invoices(id) on delete cascade,
  amount numeric not null,
  method text not null check (method in ('CASH', 'CHECK', 'CREDIT_CARD', 'BANK_TRANSFER')),
  reference text,
  date date not null,
  notes text,
  "recordedById" uuid references public.users(id) on delete set null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid references public.users(id) on delete set null,
  "userName" text,
  "userRole" text,
  action text not null,
  "entityType" text not null,
  "entityId" uuid,
  details text,
  ip text,
  timestamp timestamptz not null default now()
);

create index if not exists clients_lawyer_id_idx on public.clients ("lawyerId");
create index if not exists cases_client_id_idx on public.cases ("clientId");
create index if not exists cases_lawyer_id_idx on public.cases ("lawyerId");
create index if not exists appointments_start_time_idx on public.appointments ("startTime");
create index if not exists notifications_user_id_created_at_idx on public.notifications ("userId", "createdAt" desc);
create index if not exists invoices_client_id_idx on public.invoices ("clientId");
create index if not exists invoice_line_items_invoice_id_idx on public.invoice_line_items ("invoiceId");
create index if not exists payments_invoice_id_idx on public.payments ("invoiceId");

insert into public.users (name, email, password, role, position, "employeeId")
values
  (
    'Admin User',
    'admin@lawfirm.com',
    '$2b$10$bnnX2D9v7j1owToSYrCBU.KAKO3VIsWuyCaSHTmD6LffEMcM5nloC',
    'ADMIN',
    'Administrator',
    'EMP-001'
  ),
  (
    'John Doe',
    'john.doe@lawfirm.com',
    '$2b$10$n1xST6n93nkHJvnuMvLHCOdFaqJHC4GnAmAZOpSE.iuXoZR5VVaVe',
    'LAWYER',
    'Lawyer',
    'EMP-002'
  ),
  (
    'Reception User',
    'reception@lawfirm.com',
    '$2b$10$tKmj3te9V/jJxNMJ9cU36u6mBsqFPvSX3Zfca7F1jfzOLy.iwhQ4y',
    'RECEPTIONIST',
    'Receptionist',
    'EMP-003'
  )
on conflict (email) do update set
  name = excluded.name,
  password = excluded.password,
  role = excluded.role,
  position = excluded.position,
  "employeeId" = excluded."employeeId",
  "updatedAt" = now();
