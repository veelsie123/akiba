import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { BarChart, TrendingUp, Users, Briefcase, DollarSign } from "lucide-react";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "LAWYER"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const reportCards = [
    { name: "Case Load Distribution", description: "Overview of cases by lawyer and status.", icon: Briefcase },
    { name: "Financial Summary", description: "Billing and payment reports for the current period.", icon: DollarSign },
    { name: "Client Growth", description: "New client registrations over time.", icon: Users },
    { name: "Performance Metrics", description: "Success rates and case completion times.", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Generate and view detailed reports for your practice.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {reportCards.map((card) => (
          <div key={card.name} className="relative flex items-center space-x-4 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2">
            <div className="flex-shrink-0">
              <div className="rounded-md bg-indigo-50 p-3">
                <card.icon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <a href="#" className="focus:outline-none">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">{card.name}</p>
                <p className="truncate text-sm text-gray-500">{card.description}</p>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden bg-white shadow rounded-lg p-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
        <BarChart className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Advanced Reports</h3>
        <p className="mt-1 text-sm text-gray-500 text-center max-w-sm">
          More detailed reporting features are currently under development. Please check back later for full analytics capabilities.
        </p>
      </div>
    </div>
  );
}
