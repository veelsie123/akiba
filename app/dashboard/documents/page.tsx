"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

const documentSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  description: z.string().optional(),
  caseId: z.string().optional(),
  clientId: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface DocumentUploadProps {
  cases?: CaseOption[];
  clients?: ClientOption[];
}

type CaseOption = { id: string; caseNumber: string; title: string; client?: { name: string } | null };
type ClientOption = { id: string; name: string };

interface UploadedDocument {
  id: string;
  name: string;
  type?: string;
  size?: number;
  url?: string;
  description?: string | null;
  uploadedAt?: string;
  client?: { name?: string } | null;
  case?: { caseNumber?: string; title?: string } | null;
}

const EMPTY_CASES: CaseOption[] = [];
const EMPTY_CLIENTS: ClientOption[] = [];

export default function DocumentUpload({ cases = EMPTY_CASES, clients = EMPTY_CLIENTS }: DocumentUploadProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [availableCases, setAvailableCases] = useState(cases ?? EMPTY_CASES);
  const [availableClients, setAvailableClients] = useState(clients ?? EMPTY_CLIENTS);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
  });

  const selectedClient = useWatch({ control, name: "clientId" }) as string | undefined;

  useEffect(() => {
    const loadDocumentData = async () => {
      try {
        const [documentsResponse, clientsResponse, casesResponse] = await Promise.all([
          fetch("/api/documents"),
          fetch("/api/clients"),
          fetch("/api/cases"),
        ]);
        const [documentsData, clientsData, casesData] = await Promise.all([
          documentsResponse.json(),
          clientsResponse.json(),
          casesResponse.json(),
        ]);

        if (!documentsResponse.ok) throw new Error(documentsData.error || "Failed to load documents");
        if (!clientsResponse.ok) throw new Error(clientsData.error || "Failed to load clients");
        if (!casesResponse.ok) throw new Error(casesData.error || "Failed to load cases");

        setDocuments(Array.isArray(documentsData) ? documentsData : []);
        setAvailableClients(Array.isArray(clientsData) ? clientsData : clients);
        setAvailableCases(Array.isArray(casesData) ? casesData : cases);
      } catch (error) {
        console.error("Error loading document data:", error);
        toast.error(error instanceof Error ? error.message : "Unable to load document data");
      } finally {
        setIsLoadingDocuments(false);
      }
    };

    loadDocumentData();
  }, [cases, clients]);

  const filteredCases = selectedClient
    ? availableCases.filter((case_) => case_.client?.name === availableClients.find((client) => client.id === selectedClient)?.name)
    : availableCases;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: DocumentFormData) => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    if (data.caseId) formData.append("caseId", data.caseId);
    if (data.clientId) formData.append("clientId", data.clientId);

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to upload document");
      }

      setDocuments((current) => [responseData, ...current]);
      toast.success("Document uploaded successfully");
      router.push("/dashboard/documents");
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Document Name
          </label>
          <input
            type="text"
            {...register("name")}
            placeholder="e.g., Contract Agreement, Court Filing, Evidence Document"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Associate with Client (Optional)
          </label>
          <select
            {...register("clientId")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          >
            <option value="">Select a client</option>
            {availableClients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Associate with Case (Optional)
          </label>
          <select
            {...register("caseId")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            disabled={!selectedClient && filteredCases.length === 0}
          >
            <option value="">Select a case</option>
            {filteredCases.map((case_) => (
              <option key={case_.id} value={case_.id}>
                {case_.caseNumber} - {case_.title}
              </option>
            ))}
          </select>
          {selectedClient && filteredCases.length === 0 && (
            <p className="mt-1 text-xs text-gray-500">
              No active cases for this client
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={3}
            placeholder="Brief description of the document"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            File
          </label>
          <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PDF, DOC, DOCX, XLS, XLSX, JPG, PNG up to 10MB
              </p>
              {file && (
                <p className="text-sm text-gray-700">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
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
          disabled={uploading || !file}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Document"}
        </button>
      </div>
    </form>

    <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Document library</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">Uploaded documents</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
          {isLoadingDocuments ? "Loading..." : `${documents.length} document${documents.length === 1 ? "" : "s"}`}
        </span>
      </div>

      {isLoadingDocuments ? (
        <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Loading uploaded documents...
        </p>
      ) : documents.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          No documents have been uploaded yet.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3 font-semibold">Document</th>
                <th className="px-3 py-3 font-semibold">Client / case</th>
                <th className="px-3 py-3 font-semibold">Uploaded</th>
                <th className="px-3 py-3 font-semibold">File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((document) => (
                <tr key={document.id}>
                  <td className="px-3 py-4">
                    <p className="font-medium text-slate-900">{document.name}</p>
                    {document.description ? <p className="mt-1 text-xs text-slate-500">{document.description}</p> : null}
                  </td>
                  <td className="px-3 py-4 text-slate-600">
                    <p>{document.client?.name || "No client"}</p>
                    <p className="mt-1 text-xs text-slate-500">{document.case?.caseNumber || "No case"}</p>
                  </td>
                  <td className="px-3 py-4 text-slate-600">
                    {document.uploadedAt ? new Date(document.uploadedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-3 py-4">
                    {document.url ? (
                      <a href={document.url} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 hover:text-indigo-800">
                        Open
                      </a>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
    </>
  );
}