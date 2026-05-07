export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          password: string;
          role: "ADMIN" | "LAWYER" | "RECEPTIONIST";
          phone: string | null;
          address: string | null;
          salary: number | null;
          age: number | null;
          emergencyContact: string | null;
          emergencyPhone: string | null;
          position: string | null;
          employeeId: string | null;
          idNumber: string | null;
          bankAccount: string | null;
          bankName: string | null;
          employmentStatus: "ACTIVE" | "INACTIVE" | "TERMINATED";
          employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT";
          hireDate: string | null;
          dateOfBirth: string | null;
          terminationDate: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: Partial<Database["public"]["Tables"]["users"]["Row"]> &
          Pick<Database["public"]["Tables"]["users"]["Row"], "name" | "email" | "password">;
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
      };
      clients: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          address: string;
          company: string | null;
          notes: string | null;
          lawyerId: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: Partial<Database["public"]["Tables"]["clients"]["Row"]> &
          Pick<Database["public"]["Tables"]["clients"]["Row"], "name" | "email" | "phone" | "address">;
        Update: Partial<Database["public"]["Tables"]["clients"]["Row"]>;
      };
      cases: {
        Row: {
          id: string;
          caseNumber: string;
          title: string;
          description: string | null;
          status: "OPEN" | "PENDING" | "CLOSED";
          type: string;
          court: string | null;
          clientId: string;
          lawyerId: string | null;
          closingDate: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: Partial<Database["public"]["Tables"]["cases"]["Row"]> &
          Pick<Database["public"]["Tables"]["cases"]["Row"], "caseNumber" | "title" | "status" | "type" | "clientId">;
        Update: Partial<Database["public"]["Tables"]["cases"]["Row"]>;
      };
      appointments: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          startTime: string;
          endTime: string;
          type: string;
          status: "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
          clientId: string;
          lawyerId: string;
          caseId: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: Partial<Database["public"]["Tables"]["appointments"]["Row"]> &
          Pick<Database["public"]["Tables"]["appointments"]["Row"], "title" | "startTime" | "endTime" | "type" | "status" | "clientId" | "lawyerId">;
        Update: Partial<Database["public"]["Tables"]["appointments"]["Row"]>;
      };
      documents: {
        Row: {
          id: string;
          name: string;
          type: string;
          size: number;
          url: string;
          description: string | null;
          caseId: string | null;
          clientId: string | null;
          uploadedById: string;
          uploadedAt: string;
        };
        Insert: Partial<Database["public"]["Tables"]["documents"]["Row"]> &
          Pick<Database["public"]["Tables"]["documents"]["Row"], "name" | "type" | "size" | "url" | "uploadedById">;
        Update: Partial<Database["public"]["Tables"]["documents"]["Row"]>;
      };
      notifications: {
        Row: {
          id: string;
          title: string;
          message: string;
          type: string;
          userId: string;
          read: boolean;
          createdAt: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notifications"]["Row"]> &
          Pick<Database["public"]["Tables"]["notifications"]["Row"], "title" | "message" | "type" | "userId">;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
      };
      invoices: {
        Row: {
          id: string;
          invoiceNumber: string;
          clientId: string;
          caseId: string | null;
          dueDate: string | null;
          description: string | null;
          subtotal: number;
          tax: number;
          total: number;
          status: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: Partial<Database["public"]["Tables"]["invoices"]["Row"]> &
          Pick<Database["public"]["Tables"]["invoices"]["Row"], "invoiceNumber" | "clientId" | "total">;
        Update: Partial<Database["public"]["Tables"]["invoices"]["Row"]>;
      };
      invoice_line_items: {
        Row: {
          id: string;
          invoiceId: string;
          description: string;
          quantity: number;
          rate: number;
          amount: number;
          createdAt: string;
        };
        Insert: Partial<Database["public"]["Tables"]["invoice_line_items"]["Row"]> &
          Pick<Database["public"]["Tables"]["invoice_line_items"]["Row"], "invoiceId" | "description">;
        Update: Partial<Database["public"]["Tables"]["invoice_line_items"]["Row"]>;
      };
      payments: {
        Row: {
          id: string;
          invoiceId: string;
          amount: number;
          method: "CASH" | "CHECK" | "CREDIT_CARD" | "BANK_TRANSFER";
          reference: string | null;
          date: string;
          notes: string | null;
          recordedById: string | null;
          createdAt: string;
        };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]> &
          Pick<Database["public"]["Tables"]["payments"]["Row"], "invoiceId" | "amount" | "method" | "date">;
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          userId: string | null;
          userName: string | null;
          userRole: string | null;
          action: string;
          entityType: string;
          entityId: string | null;
          details: string | null;
          ip: string | null;
          timestamp: string;
        };
        Insert: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]> &
          Pick<Database["public"]["Tables"]["audit_logs"]["Row"], "action" | "entityType">;
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
