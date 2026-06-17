import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase, throwIfSupabaseError } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

// For demo purposes use lower bcrypt rounds to speed up hashing/login.
// Override via BCRYPT_SALT_ROUNDS env var in real deployments (keep >=10 for production).
const BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS
  ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10)
  : 6;

type StaffRequestBody = {
  name: string;
  email: string;
  password?: string;
  role?: "ADMIN" | "LAWYER" | "RECEPTIONIST";
  phone?: string;
  address?: string;
  salary?: string | number;
  age?: string | number;
  emergencyContact?: string;
  emergencyPhone?: string;
  position?: string;
  employeeId?: string;
  idNumber?: string;
  bankAccount?: string;
  bankName?: string;
  employmentStatus?: "ACTIVE" | "INACTIVE" | "TERMINATED";
  employmentType?: "FULL_TIME" | "PART_TIME" | "CONTRACT";
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as StaffRequestBody;
    console.log("Creating staff:", body.name);

    // Hash password if provided
    let hashedPassword = undefined;
    if (body.password) {
      hashedPassword = await bcrypt.hash(body.password, BCRYPT_SALT_ROUNDS);
    }

    const { data: user, error } = await supabase
      .from("users")
      .insert({
        name: body.name,
        email: body.email,
        password: hashedPassword || "",
        role: body.role || "RECEPTIONIST",
        phone: body.phone || null,
        address: body.address || null,
        salary: body.salary ? Number(body.salary) : null,
        age: body.age ? Number.parseInt(String(body.age), 10) : null,
        emergencyContact: body.emergencyContact || null,
        emergencyPhone: body.emergencyPhone || null,
        position: body.position || null,
        employeeId: body.employeeId || null,
        idNumber: body.idNumber || null,
        bankAccount: body.bankAccount || null,
        bankName: body.bankName || null,
        employmentStatus: body.employmentStatus || "ACTIVE",
        employmentType: body.employmentType || "FULL_TIME",
      })
      .select()
      .single();

    throwIfSupabaseError(error);

    return NextResponse.json({ success: true, user });
  } catch (error: unknown) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .order("createdAt", { ascending: false });

    throwIfSupabaseError(error);

    return NextResponse.json(users);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
