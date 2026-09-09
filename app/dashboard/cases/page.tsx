"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const caseSchema = z.object({
  caseNumber: z.string().min(1, "Case number is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["OPEN", "PENDING", "CLOSED"]),
  type: z.string().min(1, "Case type is required"),
  court: z.string().optional(),
  clientId: z.string().min(1, "Client is required"),
  lawyerId: z.string().optional(),
});

type CaseFormData = z.infer<typeof caseSchema>;

interface CaseFormProps {
  initialData?: CaseFormData;
  caseId?: string;
  lawyers?: { id: string; name: string }[];
  clients?: { id: string; name: string }[];
}

interface CaseRecord {
  id: string;
  caseNumber: string;
  title: string;
  type: string;
  status: string;
  court?: string | null;
  client?: { name?: string } | null;
  assignedLawyer?: { name?: string } | null;
}

export default function CaseForm({ initialData, caseId, lawyers = [], clients = [] }: CaseFormProps) {
  const router = useRouter();
  const [lawyerList, setLawyerList] = useState(lawyers);
  const [clientList, setClientList] = useState(clients);
  const [isLoadingOptions, setIsLoadingOptions] = useState(lawyers.length === 0 || clients.length === 0);
  const [caseList, setCaseList] = useState<CaseRecord[]>([]);
  const [isLoadingCases, setIsLoadingCases] = useState(true);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const requests: Promise<void>[] = [];
        requests.push(fetch("/api/cases").then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Failed to load cases");
          setCaseList(Array.isArray(data) ? data : []);
        }));
        if (lawyers.length === 0) {
          requests.push(fetch("/api/users?role=LAWYER").then(async (response) => {
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to load lawyers");
            setLawyerList(Array.isArray(data) ? data : []);
          }));
        }
        if (clients.length === 0) {
          requests.push(fetch("/api/clients").then(async (response) => {
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to load clients");
            setClientList(Array.isArray(data) ? data : []);
          }));
        }
        await Promise.all(requests);
      } catch (error) {
        console.error("Error loading case options:", error);
        toast.error(error instanceof Error ? error.message : "Unable to load case options");
      } finally {
        setIsLoadingOptions(false);
        setIsLoadingCases(false);
      }
    };

    const timer = window.setTimeout(() => void loadOptions(), 0);
    return () => window.clearTimeout(timer);
  }, [lawyers.length, clients.length]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: initialData || {
      status: "OPEN",
    },
  });

  const onSubmit = async (data: CaseFormData) => {
    try {
      const url = caseId ? `/api/cases/${caseId}` : "/api/cases";
      const method = caseId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(typeof responseData.error === "string" ? responseData.error : JSON.stringify(responseData.error || "Failed to save case"));
      }

      toast.success(caseId ? "Case updated successfully" : "Case created successfully");
      router.push("/dashboard/cases");
      router.refresh();
    } catch (error) {
      console.error("Error details:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  return (
    <div className="space-y-8">
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Matter register</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">Current cases</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
          {isLoadingCases ? "Loading..." : `${caseList.length} case${caseList.length === 1 ? "" : "s"}`}
        </span>
      </div>
      {isLoadingCases ? (
        <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Loading cases...</p>
      ) : caseList.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No cases have been created yet.</p>
      ) : (
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {caseList.map((case_) => (
            <div key={case_.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{case_.caseNumber}</p>
                  <h3 className="mt-1 font-semibold text-slate-900">{case_.title}</h3>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600">{case_.status}</span>
              </div>
              <div className="mt-4 space-y-1 text-sm text-slate-500">
                <p>{case_.type}{case_.court ? ` · ${case_.court}` : ""}</p>
                <p>Client: {case_.client?.name || "Unassigned"}</p>
                <p>Lawyer: {case_.assignedLawyer?.name || "Unassigned"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Case Number</label>
          <input
            type="text"
            {...register("caseNumber")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
          {errors.caseNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.caseNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            {...register("title")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Case Type</label>
          <input
            type="text"
            {...register("type")}
            placeholder="e.g., Civil, Criminal, Family"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Court</label>
          <input
            type="text"
            {...register("court")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Client</label>
          <select
            {...register("clientId")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          >
            <option value="">Select a client</option>
            {clientList.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          {errors.clientId && (
            <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Assigned Lawyer</label>
          <select
            {...register("lawyerId")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          >
            <option value="">Select a lawyer</option>
            {lawyerList.map((lawyer) => (
              <option key={lawyer.id} value={lawyer.id}>
                {lawyer.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            {...register("status")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          >
            <option value="OPEN">Open</option>
            <option value="PENDING">Pending</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register("description")}
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isLoadingOptions}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoadingOptions ? "Loading options..." : isSubmitting ? "Saving..." : caseId ? "Update Case" : "Create Case"}
        </button>
      </div>
    </form>
    </div>
  );
}