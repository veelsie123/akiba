"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Briefcase, Calendar, Clock, CheckCircle } from "lucide-react";
import StatCard from "./StatCard";
import RecentActivity from "./RecentActivity";
import { supabase } from "@/lib/supabase/server";

interface Case {
  id: string;
  title: string;
  status: string;
  caseNumber: string;
  createdAt: string;
}

interface Appointment {
  id: string;
  title: string;
  type: string;
  startTime: string;
  client?: {
    name: string;
  };
}

export default function LawyerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    myCases: 0,
    upcomingAppointments: 0,
    closedCases: 0,
    pendingDocuments: 0,
  });
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    async function fetchLawyerData() {
      try {
        const [myCasesCount, closedCasesCount, recentCasesData, appointmentsData] = await Promise.all([
          supabase.from("cases").select("*", { count: "exact", head: true }).eq("lawyerId", session.user.id),
          supabase.from("cases").select("*", { count: "exact", head: true }).eq("lawyerId", session.user.id).eq("status", "CLOSED"),
          supabase.from("cases").select("*").eq("lawyerId", session.user.id).order("createdAt", { ascending: false }).limit(5),
          supabase.from("appointments").select("*, client:clients(name)").eq("lawyerId", session.user.id).gte("startTime", new Date().toISOString()).order("startTime", { ascending: true }).limit(5),
        ]);

        setStats({
          myCases: myCasesCount.count || 0,
          closedCases: closedCasesCount.count || 0,
          upcomingAppointments: appointmentsData.data?.length || 0,
          pendingDocuments: 0, // Placeholder
        });

        setRecentCases(
          (recentCasesData.data || []).map((c: Case) => ({
            id: c.id,
            title: c.title,
            description: `Status: ${c.status} | Number: ${c.caseNumber}`,
            timestamp: c.createdAt,
          }))
        );

        setAppointments(
          (appointmentsData.data || []).map((a: Appointment) => ({
            id: a.id,
            title: a.title,
            description: `Meeting with ${a.client?.name} (${a.type})`,
            timestamp: a.startTime,
          }))
        );
      } catch (error) {
        console.error("Error fetching lawyer dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLawyerData();
  }, [session]);

  if (isLoading) {
    return <div className="animate-pulse">Loading Legal Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Active Cases" value={stats.myCases} icon={Briefcase} />
        <StatCard title="Closed Cases" value={stats.closedCases} icon={CheckCircle} />
        <StatCard title="Upcoming Meetings" value={stats.upcomingAppointments} icon={Calendar} />
        <StatCard title="Hours Logged" value="124" icon={Clock} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivity title="My Recent Cases" items={recentCases} />
        <RecentActivity title="Upcoming Appointments" items={appointments} emptyMessage="No upcoming appointments." />
      </div>
    </div>
  );
}
