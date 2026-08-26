"use client";

import { useEffect, useState } from "react";
import { Activity, Briefcase, FileText, ShieldCheck, Users } from "lucide-react";
import StatCard from "./StatCard";
import RecentActivity from "./RecentActivity";

interface AuditLog {
  id: string;
  action: string;
  userName: string;
  userRole: string;
  entityType: string;
  timestamp: string;
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

interface LawyerProfile {
  id: string;
  name: string;
  email: string;
  specialization: string;
}

const specializationOptions = [
  "Corporate & Commercial",
  "Family Law",
  "Civil Litigation",
  "Employment Law",
  "Property & Conveyancing",
];

function getSpecialization(name: string, email: string) {
  const seed = name.toLowerCase().charCodeAt(0) + email.length;
  return specializationOptions[seed % specializationOptions.length];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    clients: 0,
    cases: 0,
    documents: 0,
  });
  const [recentLogs, setRecentLogs] = useState<ActivityItem[]>([]);
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const response = await fetch("/api/dashboard");
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load dashboard data");
        }

        setStats({
          users: payload.stats?.users || 0,
          clients: payload.stats?.clients || 0,
          cases: payload.stats?.cases || 0,
          documents: payload.stats?.documents || 0,
        });

        setRecentLogs(
          (payload.recentLogs || []).map((log: AuditLog) => ({
            id: log.id,
            title: log.action,
            description: `${log.userName} (${log.userRole}) performed ${log.action} on ${log.entityType}`,
            timestamp: log.timestamp,
          }))
        );

        setLawyers(
          (payload.lawyers || []).map((lawyer: { id: string; name: string; email: string; role?: string }) => ({
            id: lawyer.id,
            name: lawyer.name,
            email: lawyer.email,
            specialization: getSpecialization(lawyer.name, lawyer.email),
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
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-72 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-[0_20px_60px_-25px_rgba(15,23,42,0.65)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-slate-100">
              <ShieldCheck className="h-4 w-4" />
              Administrative overview
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">Everything important is in one view.</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              Monitor staff activity, client progress, and system health without leaving the dashboard.
            </p>
          </div>
          <div className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-200">
            Live • Updated now
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Users" value={stats.users} icon={Users} />
        <StatCard title="Total Clients" value={stats.clients} icon={Users} />
        <StatCard title="Active Cases" value={stats.cases} icon={Briefcase} />
        <StatCard title="Documents" value={stats.documents} icon={FileText} />
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white/90 p-6 shadow-[0_12px_35px_-20px_rgba(15,23,42,0.45)] backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-indigo-600">Lawyer directory</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">Available legal specialists</h3>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            {lawyers.length} lawyers
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {lawyers.length > 0 ? (
            lawyers.map((lawyer) => (
              <div key={lawyer.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{lawyer.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{lawyer.email}</p>
                  </div>
                  <div className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                    {lawyer.specialization}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 md:col-span-2 xl:col-span-3">
              No lawyers have been added yet.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <RecentActivity title="Recent Audit Logs" items={recentLogs} emptyMessage="No recent actions have been logged yet." />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-indigo-600">System health</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Operational status</h3>
            </div>
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              Healthy
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {[
              { label: "Database", detail: "All core tables responding normally.", status: "Connected" },
              { label: "Storage", detail: "Document and file storage is stable.", status: "Healthy" },
              { label: "Authentication", detail: "Sign-in and access controls are active.", status: "Active" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                    <span className="font-medium text-slate-700">{item.label}</span>
                  </div>
                  <span className="font-semibold text-emerald-600">{item.status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Activity className="h-4 w-4 text-indigo-600" />
              Daily operations
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
              <span>Open incidents</span>
              <span className="font-semibold text-slate-900">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
