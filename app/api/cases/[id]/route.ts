import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase, throwIfSupabaseError } from "@/lib/supabase/server";
import { z } from "zod";

const caseSchema = z.object({
  caseNumber: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(["OPEN", "PENDING", "CLOSED"]),
  type: z.string(),
  court: z.string().optional(),
  clientId: z.string(),
  lawyerId: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    console.log("Updating case:", id, body);

    const validatedData = caseSchema.parse(body);

    const { data: case_, error } = await supabase
      .from("cases")
      .update({
        ...validatedData,
        lawyerId: validatedData.lawyerId || null,
        description: validatedData.description || null,
        court: validatedData.court || null,
        closingDate: validatedData.status === "CLOSED" ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .select()
      .single();

    throwIfSupabaseError(error);

    return NextResponse.json(case_);
  } catch (error) {
    console.error("Error updating case:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase.from("cases").delete().eq("id", id);

    throwIfSupabaseError(error);

    return NextResponse.json({ message: "Case deleted successfully" });
  } catch (error) {
    console.error("Error deleting case:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
