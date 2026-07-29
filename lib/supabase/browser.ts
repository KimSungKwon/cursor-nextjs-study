import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { getPublicEnv } from "@/commons/config/env";
import type { Database } from "@/types/supabase";

/**
 * 브라우저용 Supabase 클라이언트.
 * Cookie 기반 세션 관리 및 자동 refresh를 사용한다.
 * NEXT_PUBLIC_* 환경변수만 사용한다.
 */
export function createClient() {
  const { supabase } = getPublicEnv();

  return createBrowserClient<Database>(
    supabase.url,
    supabase.publishableKey,
  );
}
