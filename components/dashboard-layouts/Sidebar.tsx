"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Home,
  Users,
  Briefcase,
  Calendar,
  FileText,
  DollarSign,
  BarChart,
  Users2,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home, roles: ["ADMIN", "LAWYER", "RECEPTIONIST"] },
  { name: "Clients", href: "/dashboard/clients", icon: Users, roles: ["ADMIN", "LAWYER", "RECEPTIONIST"] },
  { name: "Cases", href: "/dashboard/cases", icon: Briefcase, roles: ["ADMIN", "LAWYER", "RECEPTIONIST"] },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar, roles: ["ADMIN", "LAWYER", "RECEPTIONIST"] },
  { name: "Documents", href: "/dashboard/documents", icon: FileText, roles: ["ADMIN", "LAWYER", "RECEPTIONIST"] },
  { name: "Billing", href: "/dashboard/billing", icon: DollarSign, roles: ["ADMIN", "LAWYER"] },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart, roles: ["ADMIN", "LAWYER"] },
  { name: "Staff", href: "/dashboard/staff", icon: Users2, roles: ["ADMIN"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole as string)
  );

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center">
        <h1 className="text-xl font-bold text-white">Law Firm MS</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}