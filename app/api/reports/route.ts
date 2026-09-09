import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;
    if (!session || !role || !["ADMIN", "LAWYER"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [casesResult, clientsResult, invoicesResult, paymentsResult, appointmentsResult] = await Promise.all([
      supabase.from("cases").select("id,status,lawyerId,assignedLawyer:users(name)").limit(1000),
      supabase.from("clients").select("id,name,createdAt").order("createdAt", { ascending: true }).limit(1000),
      supabase.from("invoices").select("id,total,status,createdAt").limit(1000),
      supabase.from("payments").select("amount,date").limit(2000),
      supabase.from("appointments").select("id,status,startTime").limit(1000),
    ]);

    const firstError = [casesResult.error, clientsResult.error, invoicesResult.error, paymentsResult.error, appointmentsResult.error].find(Boolean);
    if (firstError) {
      return NextResponse.json({ error: firstError.message }, { status: 500 });
    }

    const cases = casesResult.data ?? [];
    const clients = clientsResult.data ?? [];
    const invoices = invoicesResult.data ?? [];
    const payments = paymentsResult.data ?? [];
    const appointments = appointmentsResult.data ?? [];

    const caseStatus = ["OPEN", "PENDING", "CLOSED"].map((status) => ({
      status,
      count: cases.filter((case_) => case_.status === status).length,
    }));

    const lawyerCounts = new Map<string, number>();
    cases.forEach((case_) => {
      const assignedLawyer = case_.assignedLawyer as { name?: string } | { name?: string }[] | null;
      const lawyerName = Array.isArray(assignedLawyer) ? assignedLawyer[0]?.name : assignedLawyer?.name;
      const name = lawyerName || "Unassigned";
      lawyerCounts.set(name, (lawyerCounts.get(name) ?? 0) + 1);
    });

    const invoiceTotal = invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
    const paidTotal = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const clientGrowth = clients.reduce<Record<string, number>>((growth, client) => {
      const month = client.createdAt?.slice(0, 7) || "Unknown";
      growth[month] = (growth[month] ?? 0) + 1;
      return growth;
    }, {});

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      summary: {
        totalCases: cases.length,
        totalClients: clients.length,
        totalInvoices: invoices.length,
        invoiceTotal,
        paidTotal,
        outstandingTotal: Math.max(invoiceTotal - paidTotal, 0),
        completedAppointments: appointments.filter((appointment) => appointment.status === "COMPLETED").length,
      },
      caseLoad: {
        byStatus: caseStatus,
        byLawyer: Array.from(lawyerCounts, ([name, count]) => ({ name, count })),
      },
      financial: {
        invoiceTotal,
        paidTotal,
        outstandingTotal: Math.max(invoiceTotal - paidTotal, 0),
        invoiceStatuses: Array.from(new Set(invoices.map((invoice) => invoice.status))).map((status) => ({
          status,
          count: invoices.filter((invoice) => invoice.status === status).length,
        })),
      },
      clientGrowth: Object.entries(clientGrowth).map(([month, count]) => ({ month, count })),
    });
  } catch (error) {
    console.error("Error generating reports:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}
