-- Demo seed SQL for law firm management
-- Run these statements against your Supabase/Postgres database to create demo data.

-- Users
INSERT INTO users (email, name, password, role, createdAt)
VALUES
('admin@lawfirm.com', 'Admin User', '<<HASHED_PASSWORD_PLACEHOLDER>>', 'ADMIN', now()),
('john.doe@lawfirm.com', 'John Doe', '<<HASHED_PASSWORD_PLACEHOLDER>>', 'LAWYER', now()),
('reception@lawfirm.com', 'Reception', '<<HASHED_PASSWORD_PLACEHOLDER>>', 'RECEPTIONIST', now())
ON CONFLICT (email) DO NOTHING;

-- Clients
INSERT INTO clients (name, email, phone, address, company, lawyerId, createdAt)
VALUES
('Acme Corp','client1@acme.com','0712345678','123 Main St','Acme Corp', (SELECT id FROM users WHERE email='john.doe@lawfirm.com'), now()),
('Jane Smith','jane.smith@example.com','0723456789','456 Market Ave', NULL, (SELECT id FROM users WHERE email='john.doe@lawfirm.com'), now())
ON CONFLICT (email) DO NOTHING;

-- Cases
INSERT INTO cases (caseNumber, title, description, status, type, clientId, lawyerId, createdAt)
VALUES
('ACME-001','Acme Contract Dispute','Contract disagreement','OPEN','Civil', (SELECT id FROM clients WHERE email='client1@acme.com'), (SELECT id FROM users WHERE email='john.doe@lawfirm.com'), now()),
('JS-2026-01','Estate Planning','Will and trust','PENDING','Family', (SELECT id FROM clients WHERE email='jane.smith@example.com'), (SELECT id FROM users WHERE email='john.doe@lawfirm.com'), now())
ON CONFLICT (caseNumber) DO NOTHING;

-- Appointments
INSERT INTO appointments (title, description, startTime, endTime, type, clientId, lawyerId, caseId, status, createdAt)
VALUES
('Initial Consultation','Discuss case',(now() + interval '1 day'),(now() + interval '1 day' + interval '1 hour'),'Consultation', (SELECT id FROM clients WHERE email='client1@acme.com'), (SELECT id FROM users WHERE email='john.doe@lawfirm.com'), (SELECT id FROM cases WHERE caseNumber='ACME-001'), 'SCHEDULED', now())
ON CONFLICT DO NOTHING;

-- Invoices
INSERT INTO invoices (invoiceNumber, clientId, total, status, createdAt)
VALUES
('INV-1001', (SELECT id FROM clients WHERE email='client1@acme.com'), 50000, 'UNPAID', now())
ON CONFLICT (invoiceNumber) DO NOTHING;

-- Documents (metadata only)
INSERT INTO documents (name, description, clientId, caseId, url, createdAt)
VALUES
('Contract Agreement','Signed contract', (SELECT id FROM clients WHERE email='client1@acme.com'), (SELECT id FROM cases WHERE caseNumber='ACME-001'), 'https://example.com/doc.pdf', now())
ON CONFLICT DO NOTHING;

-- Notifications
INSERT INTO notifications (title, message, type, userId, createdAt)
VALUES
('Welcome Demo','Demo data has been seeded','INFO',(SELECT id FROM users WHERE email='admin@lawfirm.com'), now())
ON CONFLICT DO NOTHING;
