import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase, throwIfSupabaseError } from "@/lib/supabase/server";

function relatedName(value: { name?: string } | { name?: string }[] | null): string | undefined {
  if (Array.isArray(value)) {
    return value[0]?.name;
  }

  return value?.name;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const pattern = `%${query}%`;
    const [clientsResult, casesResult, appointmentsResult, invoicesResult] = await Promise.all([
      supabase
        .from("clients")
        .select("id,name,email")
        .or(`name.ilike.${pattern},email.ilike.${pattern},company.ilike.${pattern}`)
        .limit(5),
      supabase
        .from("cases")
        .select("id,caseNumber,title,client:clients(name)")
        .or(`caseNumber.ilike.${pattern},title.ilike.${pattern}`)
        .limit(5),
      supabase
        .from("appointments")
        .select("id,title,client:clients(name)")
        .ilike("title", pattern)
        .limit(5),
      supabase
        .from("invoices")
        .select("id,invoiceNumber,client:clients(name)")
        .ilike("invoiceNumber", pattern)
        .limit(5),
    ]);

    throwIfSupabaseError(clientsResult.error);
    throwIfSupabaseError(casesResult.error);
    throwIfSupabaseError(appointmentsResult.error);
    throwIfSupabaseError(invoicesResult.error);

    const clients = clientsResult.data ?? [];
    const cases = casesResult.data ?? [];
    const appointments = appointmentsResult.data ?? [];
    const invoices = invoicesResult.data ?? [];

    const results = [
      ...clients.map(c => ({
        id: c.id,
        title: c.name,
        type: "client" as const,
        url: `/clients/${c.id}`,
        subtitle: c.email,
      })),
      ...cases.map(c => ({
        id: c.id,
        title: `${c.caseNumber} - ${c.title}`,
        type: "case" as const,
        url: `/cases/${c.id}`,
        subtitle: relatedName(c.client),
      })),
      ...appointments.map(a => ({
        id: a.id,
        title: a.title,
        type: "appointment" as const,
        url: `/appointments/${a.id}`,
        subtitle: relatedName(a.client),
      })),
      ...invoices.map(i => ({
        id: i.id,
        title: i.invoiceNumber,
        type: "invoice" as const,
        url: `/billing/${i.id}`,
        subtitle: relatedName(i.client),
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
