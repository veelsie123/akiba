import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import LawyerDashboard from "@/components/dashboard/LawyerDashboard";
import ReceptionistDashboard from "@/components/dashboard/ReceptionistDashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const role = session.user.role;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {session.user.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here&apos;s what&apos;s happening with your practice today.
        </p>
      </header>

      {role === "ADMIN" && <AdminDashboard />}
      {role === "LAWYER" && <LawyerDashboard />}
      {role === "RECEPTIONIST" && <ReceptionistDashboard />}
    </div>
  );
}
