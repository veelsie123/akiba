import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase/server";

type DashboardLog = {
  id: string;
  action: string;
  userName: string;
  userRole: string;
  entityType: string;
  timestamp: string;
};

type DashboardLawyer = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

type DashboardCase = {
  id: string;
  title: string;
  status: string;
  caseNumber: string;
  createdAt: string;
};

type DashboardAppointment = {
  id: string;
  title: string;
  type: string;
  startTime: string;
  client?: { name: string };
};

type DashboardClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    const userId = session.user.id;

    if (role === "ADMIN") {
      const [usersCount, clientsCount, casesCount, documentsCount, logs, lawyerData] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("clients").select("*", { count: "exact", head: true }),
        supabase.from("cases").select("*", { count: "exact", head: true }),
        supabase.from("documents").select("*", { count: "exact", head: true }),
        supabase.from("audit_logs").select("*").order("timestamp", { ascending: false }).limit(5),
        supabase.from("users").select("id,name,email,role").eq("role", "LAWYER").order("name"),
      ]);

      return NextResponse.json({
        role,
        stats: {
          users: usersCount.count || 0,
          clients: clientsCount.count || 0,
          cases: casesCount.count || 0,
          documents: documentsCount.count || 0,
        },
        recentLogs: (logs.data || []).map((log: DashboardLog) => ({
          id: log.id,
          title: log.action,
          description: `${log.userName} (${log.userRole}) performed ${log.action} on ${log.entityType}`,
          timestamp: log.timestamp,
        })),
        lawyers: (lawyerData.data || []).map((lawyer: DashboardLawyer) => ({
          id: lawyer.id,
          name: lawyer.name,
          email: lawyer.email,
          role: lawyer.role,
        })),
      });
    }

    if (role === "LAWYER") {
      const [myCasesCount, closedCasesCount, recentCasesData, appointmentsData] = await Promise.all([
        supabase.from("cases").select("*", { count: "exact", head: true }).eq("lawyerId", userId),
        supabase.from("cases").select("*", { count: "exact", head: true }).eq("lawyerId", userId).eq("status", "CLOSED"),
        supabase.from("cases").select("*").eq("lawyerId", userId).order("createdAt", { ascending: false }).limit(5),
        supabase.from("appointments").select("*, client:clients(name)").eq("lawyerId", userId).gte("startTime", new Date().toISOString()).order("startTime", { ascending: true }).limit(5),
      ]);

      return NextResponse.json({
        role,
        stats: {
          myCases: myCasesCount.count || 0,
          closedCases: closedCasesCount.count || 0,
          upcomingAppointments: appointmentsData.data?.length || 0,
          pendingDocuments: 0,
        },
        recentCases: (recentCasesData.data || []).map((c: DashboardCase) => ({
          id: c.id,
          title: c.title,
          description: `Status: ${c.status} | Number: ${c.caseNumber}`,
          timestamp: c.createdAt || new Date().toISOString(),
        })),
        appointments: (appointmentsData.data || []).map((a: DashboardAppointment & { client?: { name?: string }; type?: string; startTime?: string }) => ({
          id: a.id,
          title: a.title,
          description: `Meeting with ${a.client?.name || "Unknown client"} (${a.type || "Appointment"})`,
          timestamp: a.startTime || new Date().toISOString(),
        })),
      });
    }

    if (role === "RECEPTIONIST") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [todayAppts, newClients, totalClients, appointmentsData, recentClientsData] = await Promise.all([
        supabase.from("appointments").select("*", { count: "exact", head: true }).gte("startTime", today.toISOString()).lt("startTime", tomorrow.toISOString()),
        supabase.from("clients").select("*", { count: "exact", head: true }).gte("createdAt", weekAgo.toISOString()),
        supabase.from("clients").select("*", { count: "exact", head: true }),
        supabase.from("appointments").select("*, client:clients(name), lawyer:users(name)").gte("startTime", today.toISOString()).lt("startTime", tomorrow.toISOString()).order("startTime", { ascending: true }),
        supabase.from("clients").select("*").order("createdAt", { ascending: false }).limit(5),
      ]);

      return NextResponse.json({
        role,
        stats: {
          todayAppointments: todayAppts.count || 0,
          newClientsWeek: newClients.count || 0,
          totalClients: totalClients.count || 0,
        },
        todaySchedule: (appointmentsData.data || []).map((a: DashboardAppointment & { lawyer?: { name: string } }) => ({
          id: a.id,
          title: a.title,
          description: `Client: ${a.client?.name} | Lawyer: ${a.lawyer?.name}`,
          timestamp: a.startTime,
        })),
        recentClients: (recentClientsData.data || []).map((c: DashboardClient) => ({
          id: c.id,
          title: c.name,
          description: `Email: ${c.email} | Phone: ${c.phone}`,
          timestamp: c.createdAt,
        })),
      });
    }

    return NextResponse.json({ role, stats: {}, recentLogs: [], lawyers: [] });
  } catch (error) {
    console.error("Dashboard data error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
