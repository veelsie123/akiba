"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Invoice {
  id: string;
  invoiceNumber: string;
  total?: number;
  paidAmount?: number;
  status?: string;
  dueDate?: string | null;
  client?: { name?: string } | null;
}

const formatKES = (amount: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  }).format(amount);

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const response = await fetch("/api/billing");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load invoices");
        setInvoices(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading invoices:", error);
        toast.error(error instanceof Error ? error.message : "Unable to load invoices");
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoices();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Billing</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Invoices and balances</h1>
          <p className="mt-2 text-sm text-slate-500">Create invoices with line-item amounts and track what is still outstanding.</p>
        </div>
        <Link href="/dashboard/billing/invoice" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Create invoice
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {isLoading ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No invoices have been created yet. Use “Create invoice” to add one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3 font-semibold">Invoice</th>
                  <th className="px-3 py-3 font-semibold">Client</th>
                  <th className="px-3 py-3 font-semibold">Total</th>
                  <th className="px-3 py-3 font-semibold">Balance</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((invoice) => {
                  const total = Number(invoice.total || 0);
                  const balance = Math.max(total - Number(invoice.paidAmount || 0), 0);
                  return (
                    <tr key={invoice.id}>
                      <td className="px-3 py-4 font-medium text-slate-900">{invoice.invoiceNumber}</td>
                      <td className="px-3 py-4 text-slate-600">{invoice.client?.name || "—"}</td>
                      <td className="px-3 py-4 text-slate-600">{formatKES(total)}</td>
                      <td className="px-3 py-4 font-medium text-slate-900">{formatKES(balance)}</td>
                      <td className="px-3 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {invoice.status || "DRAFT"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
