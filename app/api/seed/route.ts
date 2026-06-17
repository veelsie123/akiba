import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

// Only allow seeding when DEMO_MODE is true or not in production
const ALLOW_SEED = process.env.DEMO_MODE === "true" || process.env.NODE_ENV !== "production";
const BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : 6;

export async function POST() {
  if (!ALLOW_SEED) {
    return NextResponse.json({ error: "Seeding not allowed in this environment" }, { status: 403 });
  }

  try {
    // Create demo users
    const users = [
      { email: "admin@lawfirm.com", name: "Admin User", role: "ADMIN", password: "admin123" },
      { email: "john.doe@lawfirm.com", name: "John Doe", role: "LAWYER", password: "lawyer123" },
      { email: "reception@lawfirm.com", name: "Reception", role: "RECEPTIONIST", password: "reception123" },
    ];

    // Hash passwords
    for (const u of users) {
      u.password = await bcrypt.hash(u.password, BCRYPT_SALT_ROUNDS);
    }

    // Insert users (upsert by email to be idempotent)
    const { data: createdUsers, error: usersError } = await supabase
      .from("users")
      .upsert(users.map(u => ({ email: u.email, name: u.name, password: u.password, role: u.role })), { onConflict: ["email"] })
      .select("id,email,name,role");

    if (usersError) {
      console.error("Users insert error:", usersError);
      return NextResponse.json({ error: "Failed to insert users" }, { status: 500 });
    }

    type CreatedUser = { id: string; email: string; name: string; role: string };
    const userMap = {} as Record<string, CreatedUser | undefined>;
    (createdUsers || []).forEach((u: CreatedUser) => { userMap[u.email] = u; });

    // Create demo clients
    const clients = [
      { name: "Acme Corp", email: "client1@acme.com", phone: "0712345678", address: "123 Main St", company: "Acme Corp", lawyerId: userMap["john.doe@lawfirm.com"]?.id || null },
      { name: "Jane Smith", email: "jane.smith@example.com", phone: "0723456789", address: "456 Market Ave", company: null, lawyerId: userMap["john.doe@lawfirm.com"]?.id || null },
    ];

    const { data: createdClients, error: clientsError } = await supabase
      .from("clients")
      .upsert(clients, { onConflict: ["email"] })
      .select("id,email,name");

    if (clientsError) {
      console.error("Clients insert error:", clientsError);
      return NextResponse.json({ error: "Failed to insert clients" }, { status: 500 });
    }

    type CreatedClient = { id: string; email: string; name: string };
    const clientMap = {} as Record<string, CreatedClient | undefined>;
    (createdClients || []).forEach((c: CreatedClient) => { clientMap[c.email] = c; });

    // Create demo cases
    const cases = [
      { caseNumber: "ACME-001", title: "Acme Contract Dispute", description: "Contract disagreement", status: "OPEN", type: "Civil", clientId: clientMap["client1@acme.com"]?.id || null, lawyerId: userMap["john.doe@lawfirm.com"]?.id || null },
      { caseNumber: "JS-2026-01", title: "Estate Planning", description: "Will and trust", status: "PENDING", type: "Family", clientId: clientMap["jane.smith@example.com"]?.id || null, lawyerId: userMap["john.doe@lawfirm.com"]?.id || null },
    ];

    const { data: createdCases, error: casesError } = await supabase.from("cases").upsert(cases, { onConflict: ["caseNumber"] }).select("id,caseNumber");
    if (casesError) {
      console.error("Cases insert error:", casesError);
      return NextResponse.json({ error: "Failed to insert cases" }, { status: 500 });
    }

    type CreatedCase = { id: string; caseNumber: string };
    const caseMap = {} as Record<string, CreatedCase | undefined>;
    (createdCases || []).forEach((c: CreatedCase) => { caseMap[c.caseNumber] = c; });

    // Create demo appointments
    const now = new Date();
    const inOneDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const appointments = [
      { title: "Initial Consultation", description: "Discuss case", startTime: inOneDay.toISOString(), endTime: new Date(inOneDay.getTime() + 60 * 60 * 1000).toISOString(), type: "Consultation", clientId: clientMap["client1@acme.com"]?.id || null, lawyerId: userMap["john.doe@lawfirm.com"]?.id || null, caseId: caseMap["ACME-001"]?.id || null, status: "SCHEDULED" },
    ];

    const { error: apptError } = await supabase.from("appointments").upsert(appointments).select();
    if (apptError) {
      console.error("Appointments insert error:", apptError);
      // non-fatal
    }

    // Create demo invoice
    const invoices = [
      { invoiceNumber: "INV-1001", clientId: clientMap["client1@acme.com"]?.id || null, total: 50000, status: "UNPAID" },
    ];

    const { error: invoicesError } = await supabase.from("invoices").upsert(invoices, { onConflict: ["invoiceNumber"] }).select("id,invoiceNumber");
    if (invoicesError) {
      console.error("Invoices insert error:", invoicesError);
    }

    // Create demo document (metadata only)
    const documents = [
      { name: "Contract Agreement", description: "Signed contract", clientId: clientMap["client1@acme.com"]?.id || null, caseId: caseMap["ACME-001"]?.id || null, url: "https://example.com/doc.pdf" },
    ];

    const { error: docsError } = await supabase.from("documents").upsert(documents).select();
    if (docsError) {
      console.error("Documents insert error:", docsError);
    }

    // Notifications
    const notifications = [
      { title: "Welcome Demo", message: "Demo data has been seeded", type: "INFO", userId: userMap["admin@lawfirm.com"]?.id || null },
    ];

    await supabase.from("notifications").upsert(notifications).select();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
