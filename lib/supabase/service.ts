import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/commons/config/env";

/**
 * RLS를 우회하는 서버 전용 Supabase 클라이언트.
 * Server Action / Route Handler에서만 사용한다.
 */
export function createServiceClient() {
  const { supabase } = getServerEnv();

  return createClient(supabase.url, supabase.secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
