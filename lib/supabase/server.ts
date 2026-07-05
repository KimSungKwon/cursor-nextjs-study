import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/commons/config/env";

/**
 * ⚠️ 경고: 이 모듈은 secretKey를 사용합니다.
 * 반드시 서버 코드(서버 액션, Route Handler, Server Component)에서만 import 하세요.
 * 클라이언트 컴포넌트나 브라우저 번들에서 import하면 secretKey가 노출될 수 있습니다.
 */

// TODO: Auth 연동 시 createServerClient + cookies 패턴으로 전환하면 더 안전합니다.
// 나중에 DB 타입을 붙일 예정: createClient<Database>(...)

export function createSupabaseServerClient() {
  const { supabase } = getServerEnv();

  return createClient(supabase.url, supabase.secretKey);
}
