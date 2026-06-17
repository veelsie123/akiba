import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase, throwIfSupabaseError } from "@/lib/supabase/server";
import { z } from "zod";

const clientSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  company: z.string().optional(),
  notes: z.string().optional(),
  lawyerId: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: clients, error } = await supabase
      .from("clients")
      .select("*, assignedLawyer:users(id,name), cases(id), appointments(id), invoices(id)")
      .order("createdAt", { ascending: false });

    throwIfSupabaseError(error);

    const clientsWithCounts = (clients ?? []).map(({ cases, appointments, invoices, ...client }) => ({
      ...client,
      _count: {
        cases: cases?.length ?? 0,
        appointments: appointments?.length ?? 0,
        invoices: invoices?.length ?? 0,
      },
    }));

    return NextResponse.json(clientsWithCounts);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = clientSchema.parse(body);

    const { data: client, error } = await supabase
      .from("clients")
      .insert({
        ...validatedData,
        company: validatedData.company || null,
        notes: validatedData.notes || null,
        lawyerId: validatedData.lawyerId || null,
      })
      .select()
      .single();

    throwIfSupabaseError(error);

    // Create notification for assigned lawyer if any
    if (validatedData.lawyerId) {
      const { error: notificationError } = await supabase.from("notifications").insert({
          title: "New Client Assigned",
          message: `Client ${validatedData.name} has been assigned to you`,
          type: "CASE_ASSIGNMENT",
          userId: validatedData.lawyerId,
      });

      throwIfSupabaseError(notificationError);
    }

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
