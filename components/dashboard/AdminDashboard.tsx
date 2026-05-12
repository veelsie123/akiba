"use client";

import { useEffect, useState } from "react";
import { Users, Briefcase, FileText, Activity } from "lucide-react";
import StatCard from "./StatCard";
import RecentActivity from "./RecentActivity";
import { supabase } from "@/lib/supabase/server";

interface AuditLog {
  id: string;
  action: string;
  userName: string;
  userRole: string;
  entityType: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    clients: 0,
    cases: 0,
    documents: 0,
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const [usersCount, clientsCount, casesCount, documentsCount, logs] = await Promise.all([
          supabase.from("users").select("*", { count: "exact", head: true }),
          supabase.from("clients").select("*", { count: "exact", head: true }),
          supabase.from("cases").select("*", { count: "exact", head: true }),
          supabase.from("documents").select("*", { count: "exact", head: true }),
          supabase.from("audit_logs").select("*").order("timestamp", { ascending: false }).limit(5),
        ]);

        setStats({
          users: usersCount.count || 0,
          clients: clientsCount.count || 0,
          cases: casesCount.count || 0,
          documents: documentsCount.count || 0,
        });

        setRecentLogs(
          (logs.data || []).map((log: AuditLog) => ({
            id: log.id,
            title: log.action,
            description: `${log.userName} (${log.userRole}) performed ${log.action} on ${log.entityType}`,
            timestamp: log.timestamp,
          }))
        );
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAdminData();
  }, []);

  if (isLoading) {
    return <div className="animate-pulse">Loading Admin Insights...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={stats.users} icon={Users} />
        <StatCard title="Total Clients" value={stats.clients} icon={Users} />
        <StatCard title="Active Cases" value={stats.cases} icon={Briefcase} />
        <StatCard title="Documents" value={stats.documents} icon={FileText} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivity title="Recent Audit Logs" items={recentLogs} />
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-base font-semibold leading-6 text-gray-900 flex items-center">
            <Activity className="mr-2 h-5 w-5 text-indigo-500" />
            System Status
          </h3>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Database</span>
              <span className="font-medium text-green-600">Connected</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Storage</span>
              <span className="font-medium text-green-600">Healthy</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Authentication</span>
              <span className="font-medium text-green-600">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
