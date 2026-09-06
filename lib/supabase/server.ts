import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export function throwIfSupabaseError(error: unknown): asserts error is null {
  if (error) {
    if (error instanceof Error) {
      throw error;
    }

    const supabaseError = error as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
    };
    const context = [supabaseError.code, supabaseError.details, supabaseError.hint]
      .filter(Boolean)
      .join(" - ");
    const message = supabaseError.message
      ? `${supabaseError.message}${context ? ` (${context})` : ""}`
      : "Supabase request failed";
    throw new Error(message);
  }
}
