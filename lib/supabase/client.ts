import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "@/commons/config/env";

// 나중에 DB 타입을 붙일 예정: createBrowserClient<Database>(...)

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createSupabaseClient() {
  if (!browserClient) {
    const { supabase } = getPublicEnv();

    browserClient = createBrowserClient(
      supabase.url,
      supabase.publishableKey,
    );
  }

  return browserClient;
}
