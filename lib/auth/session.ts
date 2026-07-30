import type { UserSession } from "@/commons/store/session-store";
import {
  mapAuthUserToSession,
  mapUsersRowToSession,
} from "@/lib/auth/map-user-session";
import { createClient } from "@/lib/supabase/server";

type UsersRow = {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
};

/**
 * 서버에서 현재 Supabase 세션을 UserSession으로 반환한다.
 */
export async function getSession(): Promise<UserSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data } = await supabase
    .from("users")
    .select("id, email, display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) {
    return mapAuthUserToSession(user);
  }

  return mapUsersRowToSession(data as UsersRow);
}
