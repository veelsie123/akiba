import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase, throwIfSupabaseError } from "@/lib/supabase/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    // Remove password from update (can't change password through this endpoint)
    const updateData = { ...body };
    delete updateData.password;

    // Convert numeric fields
    if (updateData.salary) updateData.salary = parseFloat(updateData.salary);
    if (updateData.age) updateData.age = parseInt(updateData.age);
    
    // Convert date fields to Date objects
    if (updateData.hireDate) {
      updateData.hireDate = new Date(updateData.hireDate);
    }
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }
    if (updateData.terminationDate) {
      updateData.terminationDate = new Date(updateData.terminationDate);
    }

    // Remove empty strings and undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === "" || updateData[key] === null) {
        delete updateData[key];
      }
    });

    const { data: user, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    throwIfSupabaseError(error);

    // Remove password from response
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (error: unknown) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    throwIfSupabaseError(error);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove password from response
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    return NextResponse.json(userWithoutPassword);
  } catch (error: unknown) {
    console.error("Error fetching user:", error);
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
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const { id } = await params;

    // Check if user exists
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    throwIfSupabaseError(findError);

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting your own account
    if (id === session.user.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const { error } = await supabase.from("users").delete().eq("id", id);

    throwIfSupabaseError(error);

    return NextResponse.json({ message: "Staff member deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
