import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase, throwIfSupabaseError } from "@/lib/supabase/server";
import { z } from "zod";

const appointmentSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  type: z.string(),
  clientId: z.string(),
  lawyerId: z.string(),
  caseId: z.string().optional(),
  status: z.enum(["SCHEDULED", "CONFIRMED", "CANCELLED", "COMPLETED"]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Received appointment data:", body);
    
    // Validate the data
    const validatedData = appointmentSchema.parse(body);
    
    // First verify that the client and lawyer exist
    const [clientResult, lawyerResult] = await Promise.all([
      supabase.from("clients").select("id").eq("id", validatedData.clientId).maybeSingle(),
      supabase.from("users").select("id").eq("id", validatedData.lawyerId).maybeSingle(),
    ]);

    throwIfSupabaseError(clientResult.error);
    throwIfSupabaseError(lawyerResult.error);

    if (!clientResult.data) {
      return NextResponse.json(
        { error: `Client with ID ${validatedData.clientId} not found` },
        { status: 400 }
      );
    }

    if (!lawyerResult.data) {
      return NextResponse.json(
        { error: `Lawyer with ID ${validatedData.lawyerId} not found` },
        { status: 400 }
      );
    }

    // If caseId is provided, verify it exists and belongs to the client
    if (validatedData.caseId) {
      const { data: case_, error } = await supabase
        .from("cases")
        .select("id")
        .eq("id", validatedData.caseId)
        .eq("clientId", validatedData.clientId)
        .maybeSingle();

      throwIfSupabaseError(error);
      
      if (!case_) {
        return NextResponse.json(
          { error: "Case not found or does not belong to the selected client" },
          { status: 400 }
        );
      }
    }

    const appointmentData = {
      title: validatedData.title,
      description: validatedData.description || null,
      startTime: new Date(validatedData.startTime).toISOString(),
      endTime: new Date(validatedData.endTime).toISOString(),
      type: validatedData.type,
      status: validatedData.status,
      clientId: validatedData.clientId,
      lawyerId: validatedData.lawyerId,
      caseId: validatedData.caseId || null,
    };

    console.log("Processed appointment data:", JSON.stringify(appointmentData, null, 2));

    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert(appointmentData)
      .select("*, client:clients(*), lawyer:users(*), case:cases(*)")
      .single();

    throwIfSupabaseError(appointmentError);

    // Create notification for the lawyer
    const { error: notificationError } = await supabase.from("notifications").insert({
        title: "New Appointment Scheduled",
        message: `New ${validatedData.type} scheduled for ${new Date(validatedData.startTime).toLocaleDateString()}`,
        type: "APPOINTMENT_REMINDER",
        userId: validatedData.lawyerId,
    });

    throwIfSupabaseError(notificationError);

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: error.issues 
      }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(
        "*, client:clients(id,name,email), lawyer:users(id,name,email), case:cases(id,caseNumber,title)"
      )
      .order("startTime", { ascending: true });

    throwIfSupabaseError(error);

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
