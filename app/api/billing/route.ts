import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase, throwIfSupabaseError } from "@/lib/supabase/server";

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1),
  clientId: z.string().uuid(),
  caseId: z.string().uuid().optional().or(z.literal("")),
  dueDate: z.string().optional(),
  description: z.string().optional(),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  total: z.number().min(0),
  lineItems: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().min(1),
    rate: z.number().min(0),
    amount: z.number().min(0),
  })).min(1),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("*, client:clients(id,name), payments(amount)")
      .order("createdAt", { ascending: false });

    throwIfSupabaseError(error);

    return NextResponse.json((invoices ?? []).map((invoice) => ({
      ...invoice,
      paidAmount: (invoice.payments ?? []).reduce((sum: number, payment: { amount?: number }) => sum + Number(payment.amount || 0), 0),
      payments: undefined,
    })));
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role || !["ADMIN", "LAWYER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = invoiceSchema.parse(await request.json());
    const { lineItems, ...invoiceData } = data;
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        ...invoiceData,
        caseId: invoiceData.caseId || null,
        dueDate: invoiceData.dueDate || null,
        status: "DRAFT",
      })
      .select()
      .single();

    throwIfSupabaseError(invoiceError);

    const { error: lineItemsError } = await supabase
      .from("invoice_line_items")
      .insert(lineItems.map((item) => ({ ...item, invoiceId: invoice.id })));
    throwIfSupabaseError(lineItemsError);

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}
