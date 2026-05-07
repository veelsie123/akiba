"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  rate: z.number().min(0, "Rate must be positive"),
  amount: z.number(),
});

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  clientId: z.string().min(1, "Client is required"),
  caseId: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  description: z.string().optional(),
  tax: z.number().default(0),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  initialData?: InvoiceFormData;
  invoiceId?: string;
  clients: { id: string; name: string; email: string }[];
  cases: { id: string; caseNumber: string; title: string; client: { name: string } }[];
  nextInvoiceNumber: string;
}

export default function InvoiceForm({ 
  initialData, 
  invoiceId, 
  clients, 
  cases,
  nextInvoiceNumber 
}: InvoiceFormProps) {
  const router = useRouter();
  const [selectedClient, setSelectedClient] = useState<string>(initialData?.clientId || "");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: initialData || {
      invoiceNumber: nextInvoiceNumber,
      lineItems: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
      tax: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  const lineItems = watch("lineItems");
  const taxRate = watch("tax") || 0;

  // Calculate subtotal
  const subtotal = lineItems.reduce((sum, item) => {
    const amount = (item.quantity || 0) * (item.rate || 0);
    return sum + amount;
  }, 0);

  // Calculate tax amount
  const taxAmount = subtotal * (taxRate / 100);

  // Calculate total
  const total = subtotal + taxAmount;

  // Format KES currency
  const formatKES = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Update line item amount when quantity or rate changes
  const updateLineItemAmount = (index: number) => {
    const quantity = watch(`lineItems.${index}.quantity`) || 0;
    const rate = watch(`lineItems.${index}.rate`) || 0;
    setValue(`lineItems.${index}.amount`, quantity * rate);
  };

  // Filter cases based on selected client
  const filteredCases = selectedClient
    ? cases.filter(c => {
        const client = clients.find(client => client.id === selectedClient);
        return c.client.name === client?.name;
      })
    : [];

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      // Calculate amounts for each line item
      const lineItemsWithAmounts = data.lineItems.map(item => ({
        ...item,
        amount: (item.quantity || 0) * (item.rate || 0),
      }));

      const invoiceData = {
        ...data,
        lineItems: lineItemsWithAmounts,
        subtotal,
        tax: taxAmount,
        total,
      };

      console.log("Submitting invoice:", invoiceData);

      const url = invoiceId ? `/api/billing/${invoiceId}` : "/api/billing";
      const method = invoiceId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to save invoice");
      }

      toast.success(invoiceId ? "Invoice updated successfully" : "Invoice created successfully");
      router.push("/billing");
      router.refresh();
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  // Get today's date for min due date
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
          <input
            type="text"
            {...register("invoiceNumber")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            readOnly={!!invoiceId}
          />
          {errors.invoiceNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.invoiceNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Client</label>
          <select
            {...register("clientId")}
            onChange={(e) => {
              setSelectedClient(e.target.value);
              setValue("caseId", "");
            }}
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
          <label className="block text-sm font-medium text-gray-700">Related Case (Optional)</label>
          <select
            {...register("caseId")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            disabled={!selectedClient}
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
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            {...register("dueDate")}
            min={today}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Invoice Description (Optional)</label>
          <textarea
            {...register("description")}
            rows={2}
            placeholder="General description for the invoice"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
            <button
              type="button"
              onClick={() => append({ description: "", quantity: 1, rate: 0, amount: 0 })}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              + Add Item
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start space-x-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500">Description</label>
                  <input
                    type="text"
                    {...register(`lineItems.${index}.description`)}
                    onChange={() => updateLineItemAmount(index)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-500">Quantity</label>
                  <input
                    type="number"
                    {...register(`lineItems.${index}.quantity`, { valueAsNumber: true })}
                    onChange={() => updateLineItemAmount(index)}
                    min="1"
                    step="1"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-500">Rate (KES)</label>
                  <input
                    type="number"
                    {...register(`lineItems.${index}.rate`, { valueAsNumber: true })}
                    onChange={() => updateLineItemAmount(index)}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-500">Amount (KES)</label>
                  <input
                    type="number"
                    {...register(`lineItems.${index}.amount`, { valueAsNumber: true })}
                    readOnly
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm"
                  />
                </div>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="mt-6 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {errors.lineItems && (
              <p className="text-sm text-red-600">{errors.lineItems.message}</p>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatKES(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-600">Tax Rate (%):</span>
                <input
                  type="number"
                  {...register("tax", { valueAsNumber: true })}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-20 text-right border border-gray-300 rounded px-2 py-1"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax Amount:</span>
                <span className="font-medium">{formatKES(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>{formatKES(total)}</span>
              </div>
            </div>
          </div>
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
          {isSubmitting ? "Creating..." : invoiceId ? "Update Invoice" : "Create Invoice"}
        </button>
      </div>
    </form>
  );
}