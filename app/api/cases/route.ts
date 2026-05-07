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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: cases, error } = await supabase
      .from("cases")
      .select("*, client:clients(name), assignedLawyer:users(name)")
      .order("createdAt", { ascending: false });

    throwIfSupabaseError(error);

    return NextResponse.json(cases);
  } catch (error) {
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
    const validatedData = caseSchema.parse(body);

    const { data: case_, error } = await supabase
      .from("cases")
      .insert({
        ...validatedData,
        lawyerId: validatedData.lawyerId || null,
        description: validatedData.description || null,
        court: validatedData.court || null,
      })
      .select()
      .single();

    throwIfSupabaseError(error);

    // Create notification for assigned lawyer if any
    if (validatedData.lawyerId) {
      const { error: notificationError } = await supabase.from("notifications").insert({
          title: "New Case Assigned",
          message: `Case ${validatedData.caseNumber} - ${validatedData.title} has been assigned to you`,
          type: "CASE_ASSIGNMENT",
          userId: validatedData.lawyerId,
      });

      throwIfSupabaseError(notificationError);
    }

    return NextResponse.json(case_, { status: 201 });
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
