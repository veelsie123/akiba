"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Lawyer {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  address?: string;
  employeeId?: string;
  position?: string;
  department?: string;
  specialization?: string;
  experience?: string;
  barNumber?: string;
  bio?: string;
  availability?: string;
  notes?: string;
}

export default function LawyersPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [isLoadingLawyers, setIsLoadingLawyers] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    employeeId: "",
    position: "",
    department: "",
    specialization: "",
    experience: "",
    barNumber: "",
    bio: "",
    availability: "",
    notes: "",
  });

  useEffect(() => {
    const loadLawyers = async () => {
      try {
        setIsLoadingLawyers(true);
        const response = await fetch("/api/users?role=LAWYER");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load lawyers");
        }

        setLawyers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading lawyers:", error);
        toast.error(error instanceof Error ? error.message : "Unable to load lawyers");
      } finally {
        setIsLoadingLawyers(false);
      }
    };

    loadLawyers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        role: "LAWYER",
        specialization: formData.specialization || "General Practice",
        experience: formData.experience || null,
        barNumber: formData.barNumber || null,
        bio: formData.bio || null,
        availability: formData.availability || null,
        notes: formData.notes || null,
      };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create lawyer");
      }

      toast.success("Lawyer created successfully");
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        employeeId: "",
        position: "",
        department: "",
        specialization: "",
        experience: "",
        barNumber: "",
        bio: "",
        availability: "",
        notes: "",
      });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Lawyer directory</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Create and manage lawyers</h2>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            {isLoadingLawyers ? "Loading..." : `${lawyers.length} lawyers`}
          </div>
        </div>

        {isLoadingLawyers ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            Loading lawyers...
          </div>
        ) : lawyers.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No lawyers have been created yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {lawyers.map((lawyer) => (
              <div key={lawyer.id || lawyer.email} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{lawyer.name || "Unnamed lawyer"}</p>
                    <p className="mt-1 text-sm text-slate-500">{lawyer.email || "No email provided"}</p>
                  </div>
                  <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                    {lawyer.specialization || "General Practice"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  {lawyer.position ? <span className="rounded-full bg-white px-2.5 py-1">{lawyer.position}</span> : null}
                  {lawyer.department ? <span className="rounded-full bg-white px-2.5 py-1">{lawyer.department}</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-4">
          <h3 className="text-lg font-semibold text-slate-900">New lawyer profile</h3>
          <p className="text-sm text-slate-500">Create a lawyer with their specialization and essential contact details.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Full name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Password *</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Specialization *</label>
            <select name="specialization" value={formData.specialization} onChange={handleChange} required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2">
              <option value="">Select specialization</option>
              <option value="Corporate & Commercial">Corporate & Commercial</option>
              <option value="Family Law">Family Law</option>
              <option value="Civil Litigation">Civil Litigation</option>
              <option value="Employment Law">Employment Law</option>
              <option value="Property & Conveyancing">Property & Conveyancing</option>
              <option value="Criminal Law">Criminal Law</option>
              <option value="Immigration Law">Immigration Law</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Position</label>
            <input type="text" name="position" value={formData.position} onChange={handleChange} placeholder="Senior Counsel" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Department</label>
            <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="Litigation" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Bar number</label>
            <input type="text" name="barNumber" value={formData.barNumber} onChange={handleChange} placeholder="BAR-001" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Years of experience</label>
            <input type="text" name="experience" value={formData.experience} onChange={handleChange} placeholder="10 years" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Employee ID</label>
            <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="LAW-001" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Availability</label>
            <select name="availability" value={formData.availability} onChange={handleChange} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2">
              <option value="">Select availability</option>
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="On leave">On leave</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Brief bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Additional notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => router.back()} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
            {isSubmitting ? "Saving..." : "Create Lawyer"}
          </button>
        </div>
      </form>
    </div>
  );
}
