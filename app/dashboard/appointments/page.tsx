"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const appointmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  type: z.string().min(1, "Appointment type is required"),
  clientId: z.string().min(1, "Client is required"),
  lawyerId: z.string().min(1, "Lawyer is required"),
  caseId: z.string().optional(),
  status: z.enum(["SCHEDULED", "CONFIRMED", "CANCELLED", "COMPLETED"]).default("SCHEDULED"),
}).refine((data) => {
  if (!data.startTime || !data.endTime) return true;
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  initialData?: AppointmentFormData;
  appointmentId?: string;
  lawyers?: { id: string; name: string }[];
  clients?: { id: string; name: string }[];
  cases?: { id: string; caseNumber: string; title: string; clientId: string; client: { name: string } }[];
}

export default function AppointmentForm({ 
  initialData,
  appointmentId,
  lawyers = [],
  clients = [],
  cases = [],
}: AppointmentFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: initialData || {
      status: "SCHEDULED",
    },
  });

  const selectedClientId = useWatch({ control, name: "clientId" }) as string | undefined;

  // Filter cases based on selected client
  const filteredCases = cases.filter(case_ => case_.clientId === selectedClientId);

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      console.log("Submitting appointment data:", data);
      
      // Ensure dates are in the correct format
      const formattedData = {
        ...data,
        startTime: data.startTime,
        endTime: data.endTime,
      };
      
      const url = appointmentId ? `/api/appointments/${appointmentId}` : "/api/appointments";
      const method = appointmentId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const responseData = await response.json();
      console.log("Response:", response.status, responseData);

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || "Failed to save appointment");
      }

      toast.success(appointmentId ? "Appointment updated successfully" : "Appointment scheduled successfully");
      router.push("/dashboard/appointments");
      router.refresh();
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  // Generate time suggestions (9 AM to 5 PM, 30 min slots)
  const timeSlots = [];
  for (let hour = 9; hour <= 17; hour++) {
    for (const minute of [0, 30]) {
      if (hour === 17 && minute === 30) continue; // Skip 5:30 PM
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(timeString);
    }
  }

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            {...register("title")}
            placeholder="e.g., Initial Consultation, Court Hearing, Client Meeting"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Client</label>
          <select
            {...register("clientId")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
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
          <label className="block text-sm font-medium text-gray-700">Lawyer</label>
          <select
            {...register("lawyerId")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          >
            <option value="">Select a lawyer</option>
            {lawyers.map((lawyer) => (
              <option key={lawyer.id} value={lawyer.id}>
                {lawyer.name}
              </option>
            ))}
          </select>
          {errors.lawyerId && (
            <p className="mt-1 text-sm text-red-600">{errors.lawyerId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Related Case (Optional)</label>
          <select
            {...register("caseId")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            disabled={!selectedClientId}
          >
            <option value="">Select a case</option>
            {filteredCases.map((case_) => (
              <option key={case_.id} value={case_.id}>
                {case_.caseNumber} - {case_.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Appointment Type</label>
          <select
            {...register("type")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          >
            <option value="">Select type</option>
            <option value="Consultation">Consultation</option>
            <option value="Hearing">Court Hearing</option>
            <option value="Meeting">Client Meeting</option>
            <option value="Deposition">Deposition</option>
            <option value="Mediation">Mediation</option>
            <option value="Other">Other</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            {...register("status")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          >
            <option value="SCHEDULED">Scheduled</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            id="appointmentDate"
            onChange={(e) => {
              const date = e.target.value;
              const currentStart = getValues("startTime");
              const currentEnd = getValues("endTime");

              if (currentStart) {
                const timePart = currentStart.split('T')[1] || "09:00";
                setValue("startTime", `${date}T${timePart}`);
              } else {
                setValue("startTime", `${date}T09:00`);
              }

              if (currentEnd) {
                const timePart = currentEnd.split('T')[1] || "10:00";
                setValue("endTime", `${date}T${timePart}`);
              } else {
                setValue("endTime", `${date}T10:00`);
              }
            }}
            defaultValue={today}
            min={today}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Start Time</label>
          <select
            {...register("startTime")}
            onChange={(e) => {
              const value = e.target.value;
              setValue("startTime", value);

              // Auto-set end time to 1 hour later if not set
              const currentEnd = getValues("endTime");
              if (!currentEnd) {
                const startDate = new Date(value);
                const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
                setValue("endTime", endDate.toISOString().slice(0, 16));
              }
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          >
            <option value="">Select time</option>
            {timeSlots.map((time) => {
              const dateValue = useWatch({ control, name: "startTime" })?.split('T')[0] || today;
              const fullDateTime = `${dateValue}T${time}`;
              return (
                <option key={`start-${time}`} value={fullDateTime}>
                  {time}
                </option>
              );
            })}
          </select>
          {errors.startTime && (
            <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">End Time</label>
          <select
            {...register("endTime")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          >
            <option value="">Select time</option>
            {timeSlots.map((time) => {
              const dateValue = useWatch({ control, name: "endTime" })?.split('T')[0] || useWatch({ control, name: "startTime" })?.split('T')[0] || today;
              const fullDateTime = `${dateValue}T${time}`;
              return (
                <option key={`end-${time}`} value={fullDateTime}>
                  {time}
                </option>
              );
            })}
          </select>
          {errors.endTime && (
            <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register("description")}
            rows={3}
            placeholder="Additional details about the appointment"
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
          {isSubmitting ? "Scheduling..." : appointmentId ? "Update Appointment" : "Schedule Appointment"}
        </button>
      </div>
    </form>
  );
}