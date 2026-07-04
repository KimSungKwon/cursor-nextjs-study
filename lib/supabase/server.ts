import type { Database } from "@/types/supabase";

export async function createSupabaseServerClient() {
  return null as unknown as {
    from: (table: keyof Database["public"]["Tables"]) => unknown;
  };
}
