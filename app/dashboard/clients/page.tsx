"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  company: z.string().optional(),
  notes: z.string().optional(),
  lawyerId: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  initialData?: ClientFormData;
  clientId?: string;
  lawyers?: { id: string; name: string; specialization?: string }[];
}

interface LawyerOption {
  id: string;
  name: string;
  email: string;
  specialization: string;
}

interface ClientRecord {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  lawyerId?: string | null;
  assignedLawyer?: {
    id: string;
    name: string;
  } | null;
}

const lawyerSpecializations = [
  "Corporate & Commercial",
  "Family Law",
  "Civil Litigation",
  "Employment Law",
  "Property & Conveyancing",
];

function getSpecialization(name: string, email: string) {
  const seed = name.toLowerCase().charCodeAt(0) + email.length;
  return lawyerSpecializations[seed % lawyerSpecializations.length];
}

export default function ClientForm({ initialData, clientId, lawyers = [] }: ClientFormProps) {
  const router = useRouter();
  const [lawyerOptions, setLawyerOptions] = useState<LawyerOption[]>(lawyers.map((lawyer) => ({
    id: lawyer.id,
    name: lawyer.name,
    email: "",
    specialization: lawyer.specialization || "General Practice",
  })));
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData,
  });

  useEffect(() => {
    async function fetchLawyers() {
      try {
        const response = await fetch("/api/users?role=LAWYER");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load lawyers");
        }

        const nextLawyers = (data || []).map((lawyer: { id: string; name: string; email: string }) => ({
          id: lawyer.id,
          name: lawyer.name,
          email: lawyer.email,
          specialization: getSpecialization(lawyer.name, lawyer.email),
        }));

        setLawyerOptions(nextLawyers);
      } catch (error) {
        console.error("Failed to load lawyers", error);
      }
    }

    if (lawyers.length === 0) {
      fetchLawyers();
    }
  }, [lawyers]);

  useEffect(() => {
    async function fetchClients() {
      try {
        setIsLoadingClients(true);
        const response = await fetch("/api/clients");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load clients");
        }

        setClients(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load clients", error);
      } finally {
        setIsLoadingClients(false);
      }
    }

    fetchClients();
  }, []);

  const onSubmit = async (data: ClientFormData) => {
    try {
      const url = clientId ? `/api/clients/${clientId}` : "/api/clients";
      const method = clientId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save client");
      }

      toast.success(clientId ? "Client updated successfully" : "Client created successfully");
      router.push("/dashboard/clients");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Existing clients</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Client roster</h2>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            {isLoadingClients ? "Loading..." : `${clients.length} clients`}
          </div>
        </div>

        {isLoadingClients ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            Loading clients...
          </div>
        ) : clients.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No clients have been added yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {clients.map((client) => (
              <div key={client.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{client.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{client.email || client.phone || "No contact details"}</p>
                  </div>
                  {client.assignedLawyer ? (
                    <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                      {client.assignedLawyer.name}
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600">
                      Unassigned
                    </span>
                  )}
                </div>
                {client.company ? <p className="mt-3 text-sm text-slate-500">{client.company}</p> : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            {...register("name")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            {...register("email")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            {...register("phone")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Company</label>
          <input
            type="text"
            {...register("company")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            {...register("address")}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Assigned Lawyer</label>
          <select
            {...register("lawyerId")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          >
            <option value="">Select a lawyer</option>
            {lawyerOptions.map((lawyer) => (
              <option key={lawyer.id} value={lawyer.id}>
                {lawyer.name} — {lawyer.specialization}
              </option>
            ))}
          </select>
          {lawyerOptions.length === 0 && (
            <p className="mt-2 text-sm text-amber-600">No lawyers are available yet. Create staff with the Lawyer role first.</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            {...register("notes")}
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
          disabled={isSubmitting}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : clientId ? "Update Client" : "Create Client"}
        </button>
      </div>
    </form>
    </div>
  );
}