import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Briefcase, ShieldCheck, Sparkles } from "lucide-react";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import LawyerDashboard from "@/components/dashboard/LawyerDashboard";
import ReceptionistDashboard from "@/components/dashboard/ReceptionistDashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const role = session.user.role;
  const roleLabel = role === "ADMIN" ? "Administrator" : role === "LAWYER" ? "Lawyer" : "Receptionist";

  return (
    <div className="space-y-6">
      <header className="rounded-[24px] border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">{roleLabel} workspace</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Welcome back, {session.user.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Here&apos;s what&apos;s happening with your practice today, with the most important information surfaced first.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              Secure access
            </div>
            <div className="flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700">
              <Sparkles className="h-4 w-4" />
              Smarter workflows
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
              <Briefcase className="h-4 w-4" />
              {roleLabel}
            </div>
          </div>
        </div>
      </header>

      {role === "ADMIN" && <AdminDashboard />}
      {role === "LAWYER" && <LawyerDashboard />}
      {role === "RECEPTIONIST" && <ReceptionistDashboard />}
    </div>
  );
}
