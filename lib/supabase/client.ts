import type { Database } from "@/types/supabase";

export function createSupabaseClient() {
  return null as unknown as {
    from: (table: keyof Database["public"]["Tables"]) => unknown;
  };
}
