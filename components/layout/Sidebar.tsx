"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  BarChart,
  Bell,
  Briefcase,
  Calendar,
  ClipboardList,
  DollarSign,
  FileText,
  Home,
  Scale,
  User,
  UserCog,
  Users,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home, roles: ["ADMIN", "LAWYER", "RECEPTIONIST"] },
  { name: "Clients", href: "/dashboard/clients", icon: Users, roles: ["ADMIN", "LAWYER", "RECEPTIONIST"] },
  { name: "Cases", href: "/dashboard/cases", icon: Briefcase, roles: ["ADMIN", "LAWYER", "RECEPTIONIST"] },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar, roles: ["ADMIN", "LAWYER", "RECEPTIONIST"] },
  { name: "Documents", href: "/dashboard/documents", icon: FileText, roles: ["ADMIN", "LAWYER", "RECEPTIONIST"] },
  { name: "Billing", href: "/dashboard/billing", icon: DollarSign, roles: ["ADMIN", "LAWYER"] },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart, roles: ["ADMIN", "LAWYER"] },
  { name: "Staff", href: "/dashboard/staff", icon: UserCog, roles: ["ADMIN"] },
  { name: "Lawyers", href: "/dashboard/lawyers", icon: Scale, roles: ["ADMIN", "RECEPTIONIST"] },
  { name: "My Profile", href: "/dashboard/profile", icon: User, roles: ["ADMIN", "LAWYER", "RECEPTIONIST"] },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell, roles: ["ADMIN", "LAWYER", "RECEPTIONIST"] },
  { name: "Audit Log", href: "/dashboard/audit", icon: ClipboardList, roles: ["ADMIN"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const filteredNavigation = navigation.filter((item) => item.roles.includes(userRole as string));

  return (
    <div className="flex h-full w-72 flex-col bg-slate-950 px-4 py-5 text-slate-100">
      <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-lg shadow-slate-950/20">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-white">Akiba</p>
            <p className="text-xs text-slate-400">Practice Management</p>
          </div>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-1">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-500/15 text-white shadow-sm ring-1 ring-indigo-400/20"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 shrink-0 ${isActive ? "text-indigo-300" : "text-slate-400 group-hover:text-white"}`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-sm text-slate-400">
        <p className="font-medium text-slate-200">Role: {userRole ?? "Member"}</p>
        <p className="mt-1 text-xs">Keep your practice moving with a single workspace.</p>
      </div>
    </div>
  );
}