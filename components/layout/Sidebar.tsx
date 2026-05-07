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
  UserCog,
  User,
  Bell,
  ClipboardList,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home, roles: ["ADMIN", "LAWYER", "RECEPTIONIST"] },
  { name: "Clients", href: "/clients", icon: Users, roles: ["ADMIN", "LAWYER", "RECEPTIONIST"] },
  { name: "Cases", href: "/cases", icon: Briefcase, roles: ["ADMIN", "LAWYER", "RECEPTIONIST"] },
  { name: "Appointments", href: "/appointments", icon: Calendar, roles: ["ADMIN", "LAWYER", "RECEPTIONIST"] },
  { name: "Documents", href: "/documents", icon: FileText, roles: ["ADMIN", "LAWYER", "RECEPTIONIST"] },
  { name: "Billing", href: "/billing", icon: DollarSign, roles: ["ADMIN", "LAWYER"] },
  { name: "Reports", href: "/reports", icon: BarChart, roles: ["ADMIN", "LAWYER"] },
  { name: "Staff", href: "/staff", icon: UserCog, roles: ["ADMIN"] },
  { name: "My Profile", href: "/profile", icon: User, roles: ["ADMIN", "LAWYER", "RECEPTIONIST"] },
  { name: "Notifications", href: "/notifications", icon: Bell, roles: ["ADMIN", "LAWYER", "RECEPTIONIST"] },
  { name: "Audit Log", href: "/audit", icon: ClipboardList, roles: ["ADMIN"] },
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
        <h1 className="text-xl font-bold text-white">Akiba Law Firm</h1>
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
                className={`mr-3 h-5 w-5 shrink-0 ${
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