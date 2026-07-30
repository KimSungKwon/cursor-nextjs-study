import type { User } from "@supabase/supabase-js";
import type { UserRole, UserSession } from "@/commons/store/session-store";

type UsersRow = {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
};

const toUserRole = (role: string | null | undefined): UserRole => {
  return role === "admin" ? "admin" : "user";
};

/**
 * public.users 행을 UserSession으로 변환한다.
 */
export const mapUsersRowToSession = (row: UsersRow): UserSession => {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: toUserRole(row.role),
  };
};

/**
 * public.users가 없을 때 auth.users 메타데이터로 폴백한다.
 */
export const mapAuthUserToSession = (user: User): UserSession => {
  const metadata = user.user_metadata ?? {};
  const displayName =
    (typeof metadata.display_name === "string" && metadata.display_name) ||
    (typeof metadata.name === "string" && metadata.name) ||
    (typeof metadata.username === "string" && metadata.username) ||
    null;

  return {
    id: user.id,
    email: user.email ?? "",
    displayName,
    role: toUserRole(
      typeof metadata.role === "string" ? metadata.role : undefined,
    ),
  };
};
