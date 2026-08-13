import { getSession } from "@/lib/auth/session";

/**
 * 현재 세션이 admin인지 확인한다.
 */
export async function checkAdminAccess(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "admin";
}
