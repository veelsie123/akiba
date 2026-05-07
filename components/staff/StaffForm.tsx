"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface StaffFormProps {
  staff?: any;
  staffId?: string;
}

export default function StaffForm({ staff, staffId }: StaffFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Helper function to format date for input field
  const formatDateForInput = (date: string | Date | null | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    name: staff?.name || "",
    email: staff?.email || "",
    password: "",
    role: staff?.role || "RECEPTIONIST",
    phone: staff?.phone || "",
    address: staff?.address || "",
    employeeId: staff?.employeeId || "",
    position: staff?.position || "",
    department: staff?.department || "",
    employmentType: staff?.employmentType || "FULL_TIME",
    employmentStatus: staff?.employmentStatus || "ACTIVE",
    hireDate: formatDateForInput(staff?.hireDate),
    age: staff?.age || "",
    idNumber: staff?.idNumber || "",
    emergencyContact: staff?.emergencyContact || "",
    emergencyPhone: staff?.emergencyPhone || "",
    salary: staff?.salary || "",
    bankName: staff?.bankName || "",
    bankAccount: staff?.bankAccount || "",
    notes: staff?.notes || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare data for submission - convert empty strings to null for the API
      const submitData: any = {};
      
      for (const [key, value] of Object.entries(formData)) {
        if (value !== "" && value !== null && value !== undefined) {
          // Handle hireDate specially - keep as string for the API to convert
          if (key === "hireDate") {
            submitData[key] = value;
          }
          // Handle numeric fields
          else if (key === "salary" || key === "age") {
            submitData[key] = value ? parseFloat(value) : null;
          }
          // Handle password only for new staff
          else if (key === "password" && !staffId && value) {
            submitData[key] = value;
          }
          // Handle all other fields
          else if (key !== "password") {
            submitData[key] = value;
          }
        }
      }

      const url = staffId ? `/api/users/${staffId}` : "/api/users";
      const method = staffId ? "PUT" : "POST";

      console.log("Submitting data:", submitData);

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save staff member");
      }

      toast.success(staffId ? "Staff member updated successfully!" : "Staff member created successfully!");
      
      // Redirect to staff list after 1 second
      setTimeout(() => {
        router.push("/staff");
        router.refresh();
      }, 1000);
    } catch (error: any) {
      console.error("Error saving staff:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        <p className="text-sm text-gray-500">Staff member's basic details</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name *</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter full name" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email *</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>

        {!staffId && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Password *</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Enter password" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
        )}

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
            <option value="ADMIN">Admin</option>
            <option value="LAWYER">Lawyer</option>
            <option value="RECEPTIONIST">Receptionist</option>
            <option value="PARALEGAL">Paralegal</option>
            <option value="ACCOUNTANT">Accountant</option>
            <option value="HR_MANAGER">HR Manager</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input type="number" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea name="address" value={formData.address} onChange={handleChange} rows={2} placeholder="Enter address" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
      </div>

      {/* Employment Details */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">Employment Details</h3>
        <p className="text-sm text-gray-500">Job information and status</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Employee ID</label>
          <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="EMP-AKIBA-001" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Position</label>
          <input type="text" name="position" value={formData.position} onChange={handleChange} placeholder="e.g., Senior Lawyer" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="e.g., Legal, Finance, HR" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>

        <div>
          <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700">Employment Type</label>
          <select id="employmentType" name="employmentType" value={formData.employmentType} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERN">Intern</option>
            <option value="PROBATION">Probation</option>
          </select>
        </div>

        <div>
          <label htmlFor="employmentStatus" className="block text-sm font-medium text-gray-700">Employment Status</label>
          <select id="employmentStatus" name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="TERMINATED">Terminated</option>
            <option value="RESIGNED">Resigned</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Hire Date</label>
          <input type="date" name="hireDate" value={formData.hireDate} onChange={handleChange} placeholder="Enter date..." className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
      </div>

      {/* Personal Information */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
        <p className="text-sm text-gray-500">Demographic and identification</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Age</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Enter age" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">ID Number</label>
          <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} placeholder="National ID/Passport" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>
        <p className="text-sm text-gray-500">Person to contact in case of emergency</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Name</label>
          <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="Enter your emergency contact..." className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
          <input type="number" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} placeholder="Enter your emergency number" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
      </div>

      {/* Financial Information */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">Financial Information</h3>
        <p className="text-sm text-gray-500">Salary and banking details</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Salary (KES/month)</label>
          <input type="number" name="salary" value={formData.salary} onChange={handleChange} placeholder="Enter your salary" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bank Name</label>
          <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} placeholder="e.g., KCB, Equity" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bank Account Number</label>
          <input type="number" name="bankAccount" value={formData.bankAccount} onChange={handleChange} placeholder="Enter your bank account number" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Any additional information about the staff member..." />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
          {isSubmitting ? "Saving..." : staffId ? "Update Staff" : "Create Staff"}
        </button>
      </div>
    </form>
  );
}