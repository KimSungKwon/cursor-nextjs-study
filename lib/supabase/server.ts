import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getPublicEnv } from "@/commons/config/env";
import type { Database } from "@/types/supabase";

/**
 * 서버용 Supabase 클라이언트.
 * Cookie 기반 세션을 사용하며 Server Component / Route Handler / Server Action에서만 사용한다.
 * 클라이언트 컴포넌트에서 import하지 말 것.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { supabase } = getPublicEnv();

  return createServerClient<Database>(
    supabase.url,
    supabase.publishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component에서 호출 시 쿠키 쓰기가 막힐 수 있음
          }
        },
      },
    },
  );
}
