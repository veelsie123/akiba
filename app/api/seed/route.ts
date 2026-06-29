import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

const ALLOW_SEED =
  process.env.DEMO_MODE === "true" || process.env.NODE_ENV !== "production";
const BCRYPT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS
  ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10)
  : 6;

export async function POST() {
  if (!ALLOW_SEED) {
    return NextResponse.json(
      { error: "Seeding not allowed in this environment" },
      { status: 403 }
    );
  }

  try {
    // ── 1. USERS ──────────────────────────────────────────────────────────────
    const rawUsers = [
      { email: "admin@lawfirm.com",       name: "Admin User",   role: "ADMIN",        password: "admin123",     position: "Administrator",    employeeId: "EMP-001" },
      { email: "john.doe@lawfirm.com",    name: "John Doe",     role: "LAWYER",       password: "lawyer123",    position: "Senior Associate", employeeId: "EMP-002" },
      { email: "reception@lawfirm.com",   name: "Alice Mwangi", role: "RECEPTIONIST", password: "reception123", position: "Receptionist",     employeeId: "EMP-003" },
    ];

    for (const u of rawUsers) {
      u.password = await bcrypt.hash(u.password, BCRYPT_ROUNDS);
    }

    const { data: createdUsers, error: usersError } = await supabase
      .from("users")
      .upsert(
        rawUsers.map((u) => ({
          email: u.email, name: u.name, password: u.password,
          role: u.role, position: u.position, employeeId: u.employeeId,
        })),
        { onConflict: ["email"] }
      )
      .select("id,email,name,role");

    if (usersError) throw new Error(`Users: ${usersError.message}`);

    const userMap = Object.fromEntries(
      (createdUsers ?? []).map((u) => [u.email, u])
    );
    const adminId    = userMap["admin@lawfirm.com"]?.id;
    const lawyerId   = userMap["john.doe@lawfirm.com"]?.id;
    const receptionId = userMap["reception@lawfirm.com"]?.id;

    if (!adminId || !lawyerId || !receptionId) {
      throw new Error("Core users missing — check upsert result");
    }

    // ── 2. CLIENTS ────────────────────────────────────────────────────────────
    const clients = [
      { name: "Acme Corporation",    email: "contact@acme.co.ke",          phone: "0712345678", address: "14 Industrial Rd, Nairobi",     company: "Acme Corporation",    lawyerId },
      { name: "Jane Kariuki",        email: "jane.kariuki@gmail.com",       phone: "0723456789", address: "78 Garden Estate, Nairobi",     company: null,                  lawyerId },
      { name: "Summit Hotels Ltd",   email: "legal@summithotels.co.ke",     phone: "0734567890", address: "Summit House, Upperhill",       company: "Summit Hotels Ltd",   lawyerId },
      { name: "Peter Omondi",        email: "peter.omondi@outlook.com",     phone: "0745678901", address: "22 Ngong Road, Nairobi",        company: null,                  lawyerId },
      { name: "Greenleaf Investments",email: "info@greenleaf.co.ke",        phone: "0756789012", address: "Greenleaf Plaza, Westlands",    company: "Greenleaf Investments", lawyerId },
      { name: "Mary Wanjiku",        email: "mary.wanjiku@yahoo.com",       phone: "0767890123", address: "45 Kiambu Road, Kiambu",        company: null,                  lawyerId },
      { name: "TechBridge Africa",   email: "legal@techbridge.africa",      phone: "0778901234", address: "Strathmore Business Park",      company: "TechBridge Africa",   lawyerId },
      { name: "Samuel Mutua",        email: "samuel.mutua@gmail.com",       phone: "0789012345", address: "12 Mombasa Road, Nairobi",      company: null,                  lawyerId },
    ];

    const { data: createdClients, error: clientsError } = await supabase
      .from("clients")
      .upsert(clients, { onConflict: ["email"] })
      .select("id,email,name");

    if (clientsError) throw new Error(`Clients: ${clientsError.message}`);

    const cm = Object.fromEntries(
      (createdClients ?? []).map((c) => [c.email, c])
    );
    const acmeId      = cm["contact@acme.co.ke"]?.id;
    const janeId      = cm["jane.kariuki@gmail.com"]?.id;
    const summitId    = cm["legal@summithotels.co.ke"]?.id;
    const peterId     = cm["peter.omondi@outlook.com"]?.id;
    const greenleafId = cm["info@greenleaf.co.ke"]?.id;
    const maryId      = cm["mary.wanjiku@yahoo.com"]?.id;
    const techId      = cm["legal@techbridge.africa"]?.id;
    const samId       = cm["samuel.mutua@gmail.com"]?.id;

    // ── 3. CASES ──────────────────────────────────────────────────────────────
    const cases = [
      { caseNumber: "CASE-2026-001", title: "Acme Contract Dispute",           description: "Breach of supplier agreement",          status: "OPEN",    type: "Commercial",          clientId: acmeId,      lawyerId },
      { caseNumber: "CASE-2026-002", title: "Kariuki Estate Planning",          description: "Will drafting and trust setup",          status: "OPEN",    type: "Family",              clientId: janeId,      lawyerId },
      { caseNumber: "CASE-2026-003", title: "Summit Hotels Land Acquisition",   description: "Due diligence on Westlands plot",        status: "PENDING", type: "Property",            clientId: summitId,    lawyerId },
      { caseNumber: "CASE-2026-004", title: "Omondi Employment Dispute",        description: "Wrongful termination claim",             status: "OPEN",    type: "Employment",          clientId: peterId,     lawyerId },
      { caseNumber: "CASE-2025-018", title: "Greenleaf Share Transfer",         description: "Transfer of 40% shareholding",          status: "CLOSED",  type: "Corporate",           clientId: greenleafId, lawyerId, closingDate: new Date("2025-11-15").toISOString() },
      { caseNumber: "CASE-2025-024", title: "Wanjiku Divorce Settlement",       description: "Matrimonial property division",          status: "CLOSED",  type: "Family",              clientId: maryId,      lawyerId, closingDate: new Date("2026-01-08").toISOString() },
      { caseNumber: "CASE-2026-005", title: "TechBridge IP Registration",       description: "Trademark and patent filing with KIPI",  status: "PENDING", type: "Intellectual Property", clientId: techId,   lawyerId },
    ];

    const { data: createdCases, error: casesError } = await supabase
      .from("cases")
      .upsert(cases, { onConflict: ["caseNumber"] })
      .select("id,caseNumber");

    if (casesError) throw new Error(`Cases: ${casesError.message}`);

    const caseMap = Object.fromEntries(
      (createdCases ?? []).map((c) => [c.caseNumber, c])
    );

    // ── 4. CLEAR time-sensitive tables before fresh insert ───────────────────
    const zero = "00000000-0000-0000-0000-000000000000";
    await supabase.from("appointments").delete().neq("id", zero);
    await supabase.from("documents").delete().neq("id", zero);
    await supabase.from("audit_logs").delete().neq("id", zero);
    await supabase.from("notifications").delete().neq("id", zero);

    // ── 5. APPOINTMENTS ───────────────────────────────────────────────────────
    // today() helpers — always relative to now so receptionist/lawyer dashboards
    // show correct data no matter when the seed runs.
    const now = new Date();
    const todayAt = (h: number, m = 0) => {
      const d = new Date(now); d.setHours(h, m, 0, 0); return d.toISOString();
    };
    const daysFromNow = (n: number, h = 10) => {
      const d = new Date(now); d.setDate(d.getDate() + n); d.setHours(h, 0, 0, 0);
      return d.toISOString();
    };

    const appointments = [
      // ── Today (feeds Receptionist: "Appointments Today" + "Today's Schedule")
      {
        title: "Initial Consultation — Acme",
        description: "Review contract dispute and advise on next steps",
        startTime: todayAt(9), endTime: todayAt(10),
        type: "Consultation", status: "SCHEDULED",
        clientId: acmeId, lawyerId, caseId: caseMap["CASE-2026-001"]?.id,
      },
      {
        title: "Estate Review — Kariuki",
        description: "Go through will draft v2 with client",
        startTime: todayAt(14), endTime: todayAt(15),
        type: "Review", status: "CONFIRMED",
        clientId: janeId, lawyerId, caseId: caseMap["CASE-2026-002"]?.id,
      },
      {
        title: "Omondi Progress Update",
        description: "Employment claim status update",
        startTime: todayAt(16, 30), endTime: todayAt(17, 30),
        type: "Update", status: "SCHEDULED",
        clientId: peterId, lawyerId, caseId: caseMap["CASE-2026-004"]?.id,
      },
      // ── Upcoming (feeds Lawyer: "Upcoming Appointments" + "Upcoming Meetings" count)
      {
        title: "Summit Site Inspection",
        description: "Land due diligence walkthrough in Westlands",
        startTime: daysFromNow(2, 9), endTime: daysFromNow(2, 11),
        type: "Site Visit", status: "SCHEDULED",
        clientId: summitId, lawyerId, caseId: caseMap["CASE-2026-003"]?.id,
      },
      {
        title: "TechBridge IP Strategy",
        description: "Trademark filing strategy session",
        startTime: daysFromNow(4, 14), endTime: daysFromNow(4, 15),
        type: "Strategy", status: "CONFIRMED",
        clientId: techId, lawyerId, caseId: caseMap["CASE-2026-005"]?.id,
      },
      {
        title: "Samuel Mutua — New Client Intake",
        description: "First meeting, gather case details",
        startTime: daysFromNow(6, 11), endTime: daysFromNow(6, 12),
        type: "Consultation", status: "SCHEDULED",
        clientId: samId, lawyerId, caseId: null,
      },
    ];

    const { error: apptError } = await supabase.from("appointments").insert(appointments);
    if (apptError) console.error("Appointments:", apptError.message);

    // ── 6. DOCUMENTS ──────────────────────────────────────────────────────────
    const documents = [
      { name: "Acme Supplier Agreement",    type: "PDF",  size: 245000, url: "https://example.com/docs/acme-contract.pdf",       description: "Original signed contract",          clientId: acmeId,      caseId: caseMap["CASE-2026-001"]?.id, uploadedById: adminId  },
      { name: "Kariuki Will — Draft v2",    type: "DOCX", size:  89000, url: "https://example.com/docs/kariuki-will-v2.docx",    description: "Second draft of will",              clientId: janeId,      caseId: caseMap["CASE-2026-002"]?.id, uploadedById: lawyerId },
      { name: "Summit Land Title Deed",     type: "PDF",  size: 512000, url: "https://example.com/docs/summit-title.pdf",        description: "Official title deed",               clientId: summitId,    caseId: caseMap["CASE-2026-003"]?.id, uploadedById: lawyerId },
      { name: "Omondi Termination Letter",  type: "PDF",  size:  67000, url: "https://example.com/docs/omondi-termination.pdf",  description: "Employer's termination notice",     clientId: peterId,     caseId: caseMap["CASE-2026-004"]?.id, uploadedById: adminId  },
      { name: "TechBridge Trademark App",   type: "PDF",  size: 320000, url: "https://example.com/docs/techbridge-tm.pdf",       description: "KIPI trademark application",        clientId: techId,      caseId: caseMap["CASE-2026-005"]?.id, uploadedById: lawyerId },
    ];

    const { error: docsError } = await supabase.from("documents").insert(documents);
    if (docsError) console.error("Documents:", docsError.message);

    // ── 7. AUDIT LOGS ─────────────────────────────────────────────────────────
    const ago = (days: number) =>
      new Date(now.getTime() - days * 86_400_000).toISOString();

    const auditLogs = [
      { userName: "John Doe",     userRole: "LAWYER",       action: "CASE_CREATED",         entityType: "Case",        details: "Opened CASE-2026-005 for TechBridge Africa",              timestamp: ago(1) },
      { userName: "Admin User",   userRole: "ADMIN",        action: "USER_UPDATED",          entityType: "User",        details: "Updated profile for John Doe",                            timestamp: ago(1) },
      { userName: "Alice Mwangi", userRole: "RECEPTIONIST", action: "CLIENT_REGISTERED",     entityType: "Client",      details: "Registered new client Samuel Mutua",                      timestamp: ago(2) },
      { userName: "John Doe",     userRole: "LAWYER",       action: "DOCUMENT_UPLOADED",     entityType: "Document",    details: "Uploaded TechBridge Trademark Application",               timestamp: ago(2) },
      { userName: "Admin User",   userRole: "ADMIN",        action: "INVOICE_GENERATED",     entityType: "Invoice",     details: "Generated INV-1003 for Summit Hotels Ltd (KES 120,000)", timestamp: ago(3) },
      { userName: "Alice Mwangi", userRole: "RECEPTIONIST", action: "APPOINTMENT_SCHEDULED", entityType: "Appointment", details: "Booked Initial Consultation for Acme Corporation",        timestamp: ago(3) },
      { userName: "John Doe",     userRole: "LAWYER",       action: "CASE_CLOSED",           entityType: "Case",        details: "Closed CASE-2025-024 — Wanjiku Divorce Settlement",       timestamp: ago(5) },
      { userName: "Admin User",   userRole: "ADMIN",        action: "SYSTEM_BACKUP",         entityType: "System",      details: "Scheduled database backup completed successfully",         timestamp: ago(7) },
    ];

    const { error: auditError } = await supabase.from("audit_logs").insert(auditLogs);
    if (auditError) console.error("Audit logs:", auditError.message);

    // ── 8. NOTIFICATIONS ──────────────────────────────────────────────────────
    const notifications = [
      { title: "New Case Assigned",    message: "CASE-2026-005 (TechBridge IP Registration) has been assigned to you.",                       type: "CASE_ASSIGNMENT",    userId: lawyerId },
      { title: "Appointment Reminder", message: "You have 3 appointments scheduled for today. Check the calendar for the full schedule.",       type: "APPOINTMENT_REMINDER", userId: receptionId },
      { title: "Payment Received",     message: "Greenleaf Investments has settled invoice INV-1002 (KES 85,000). Marked as paid.",             type: "PAYMENT_RECEIVED",   userId: adminId },
      { title: "Invoice Generated",    message: "Invoice INV-1003 for Summit Hotels Ltd (KES 120,000) is ready for your review.",               type: "INVOICE_GENERATED",  userId: lawyerId },
    ];

    const { error: notifError } = await supabase.from("notifications").insert(notifications);
    if (notifError) console.error("Notifications:", notifError.message);

    return NextResponse.json({
      success: true,
      seeded: {
        users: rawUsers.length,
        clients: clients.length,
        cases: cases.length,
        appointments: appointments.length,
        documents: documents.length,
        auditLogs: auditLogs.length,
        notifications: notifications.length,
      },
    });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
