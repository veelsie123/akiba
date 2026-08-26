"use client";

import { useEffect, useState } from "react";
import { Calendar, Users, PlusCircle } from "lucide-react";
import StatCard from "./StatCard";
import RecentActivity from "./RecentActivity";
import Link from "next/link";

interface Appointment {
  id: string;
  title: string;
  startTime: string;
  client?: {
    name: string;
  };
  lawyer?: {
    name: string;
  };
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export default function ReceptionistDashboard() {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    newClientsWeek: 0,
    totalClients: 0,
  });
  interface ActivityItem { id: string; title: string; description: string; timestamp: string; }
  const [todaySchedule, setTodaySchedule] = useState<ActivityItem[]>([]);
  const [recentClients, setRecentClients] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReceptionistData() {
      try {
        const response = await fetch("/api/dashboard");
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load dashboard data");
        }

        setStats({
          todayAppointments: payload.stats?.todayAppointments || 0,
          newClientsWeek: payload.stats?.newClientsWeek || 0,
          totalClients: payload.stats?.totalClients || 0,
        });

        setTodaySchedule(
          (payload.todaySchedule || []).map((a: Appointment) => ({
            id: a.id,
            title: a.title,
            description: `Client: ${a.client?.name} | Lawyer: ${a.lawyer?.name}`,
            timestamp: a.startTime,
          }))
        );

        setRecentClients(
          (payload.recentClients || []).map((c: Client) => ({
            id: c.id,
            title: c.name,
            description: `Email: ${c.email} | Phone: ${c.phone}`,
            timestamp: c.createdAt,
          }))
        );
      } catch (error) {
        console.error("Error fetching receptionist dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReceptionistData();
  }, []);

  if (isLoading) {
    return <div className="animate-pulse">Loading Reception Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Appointments Today" value={stats.todayAppointments} icon={Calendar} />
        <StatCard title="New Clients (Week)" value={stats.newClientsWeek} icon={PlusCircle} />
        <StatCard title="Total Clients" value={stats.totalClients} icon={Users} />
      </div>

      <div className="flex space-x-4">
        <Link
          href="/dashboard/clients"
          className="flex items-center rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Add Client
        </Link>
        <Link
          href="/dashboard/appointments"
          className="flex items-center rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          <Calendar className="mr-2 h-5 w-5" />
          Schedule Appointment
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivity title="Today's Schedule" items={todaySchedule} emptyMessage="No appointments scheduled for today." />
        <RecentActivity title="Recent Clients" items={recentClients} />
      </div>
    </div>
  );
}
