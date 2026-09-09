"use client";

import { useEffect, useState } from "react";
import { BarChart, Briefcase, DollarSign, RefreshCw, TrendingUp, Users, type LucideIcon } from "lucide-react";
import toast from "react-hot-toast";

type ReportData = {
  generatedAt: string;
  summary: {
    totalCases: number;
    totalClients: number;
    totalInvoices: number;
    invoiceTotal: number;
    paidTotal: number;
    outstandingTotal: number;
    completedAppointments: number;
  };
  caseLoad: { byStatus: { status: string; count: number }[]; byLawyer: { name: string; count: number }[] };
  financial: { invoiceTotal: number; paidTotal: number; outstandingTotal: number; invoiceStatuses: { status: string; count: number }[] };
  clientGrowth: { month: string; count: number }[];
};

const formatKES = (amount: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);

export default function ReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadReport = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/reports", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate report");
      setReport(data);
    } catch (error) {
      console.error("Error loading report:", error);
      toast.error(error instanceof Error ? error.message : "Unable to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void loadReport(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Insights</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Reports & Analytics</h1>
          <p className="mt-2 text-sm text-slate-500">Generate a current snapshot of workload, finances, clients, and completed work.</p>
        </div>
        <button type="button" onClick={() => void loadReport()} disabled={isLoading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Generate report
        </button>
      </header>

      {isLoading ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Generating report...</div> : report ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {([
              { label: "Total cases", value: report.summary.totalCases, icon: Briefcase },
              { label: "Total clients", value: report.summary.totalClients, icon: Users },
              { label: "Outstanding", value: formatKES(report.summary.outstandingTotal), icon: DollarSign },
              { label: "Completed appointments", value: report.summary.completedAppointments, icon: TrendingUp },
            ] satisfies { label: string; value: string | number; icon: LucideIcon }[]).map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between"><p className="text-sm text-slate-500">{label}</p><Icon className="h-5 w-5 text-indigo-500" /></div>
                <p className="mt-4 text-2xl font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3"><div className="rounded-xl bg-indigo-50 p-2 text-indigo-600"><BarChart className="h-5 w-5" /></div><h2 className="font-semibold text-slate-900">Case load distribution</h2></div>
              <div className="mt-6 space-y-4">{report.caseLoad.byStatus.map((item) => <div key={item.status}><div className="flex justify-between text-sm"><span className="text-slate-600">{item.status}</span><span className="font-medium text-slate-900">{item.count}</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-indigo-500" style={{ width: `${report.summary.totalCases ? (item.count / report.summary.totalCases) * 100 : 0}%` }} /></div></div>)}</div>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-50 p-2 text-emerald-600"><DollarSign className="h-5 w-5" /></div><h2 className="font-semibold text-slate-900">Financial summary</h2></div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center"><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Invoiced</p><p className="mt-1 font-semibold text-slate-900">{formatKES(report.financial.invoiceTotal)}</p></div><div className="rounded-xl bg-emerald-50 p-3"><p className="text-xs text-emerald-700">Paid</p><p className="mt-1 font-semibold text-emerald-900">{formatKES(report.financial.paidTotal)}</p></div><div className="rounded-xl bg-amber-50 p-3"><p className="text-xs text-amber-700">Due</p><p className="mt-1 font-semibold text-amber-900">{formatKES(report.financial.outstandingTotal)}</p></div></div>
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3"><div className="rounded-xl bg-violet-50 p-2 text-violet-600"><Users className="h-5 w-5" /></div><h2 className="font-semibold text-slate-900">Client growth</h2></div>
            {report.clientGrowth.length === 0 ? <p className="mt-6 text-sm text-slate-500">No client registrations are available yet.</p> : <div className="mt-6 flex flex-wrap items-end gap-4">{report.clientGrowth.map((item) => <div key={item.month} className="flex min-w-16 flex-col items-center gap-2"><div className="w-10 rounded-t-lg bg-violet-500" style={{ height: `${Math.max(item.count * 18, 12)}px` }} /><span className="text-xs text-slate-500">{item.month}</span><span className="text-xs font-semibold text-slate-700">{item.count}</span></div>)}</div>}
          </section>
          <p className="text-xs text-slate-400">Generated {new Date(report.generatedAt).toLocaleString()}</p>
        </>
      ) : null}
    </div>
  );
}
