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
  specialization?: string;
  experience?: string;
  barNumber?: string;
  bio?: string;
  availability?: string;
  notes?: string;
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
        specialization: body.specialization || null,
        experience: body.experience || null,
        barNumber: body.barNumber || null,
        bio: body.bio || null,
        availability: body.availability || null,
        notes: body.notes || null,
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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;
    if (!session || !role || !["ADMIN", "LAWYER", "RECEPTIONIST"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleFilter = request.nextUrl.searchParams.get("role");

    let { data: users, error } = await supabase
      .from("users")
      .select("id,name,email,role")
      .limit(200);

    if (error) {
      const fallback = await supabase.from("users").select("id,name,email,role");
      users = fallback.data ?? [];
      error = fallback.error;
    }

    if (error) {
      throwIfSupabaseError(error);
    }

    const filteredUsers = roleFilter
      ? (users ?? []).filter((user: { role?: string }) => user.role === roleFilter)
      : users ?? [];

    return NextResponse.json(filteredUsers);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
