import { redirect } from "next/navigation";
import { AUTH_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import { getSession } from "@/lib/auth/session";

/**
 * 현재 세션이 admin인지 확인한다.
 */
export async function checkAdminAccess(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "admin";
}

/**
 * admin이 아니면 로그인/홈으로 redirect한다.
 */
export async function requireAdminAccess(): Promise<void> {
  const session = await getSession();

  if (!session) {
    redirect(AUTH_URLS.LOGIN);
  }

  if (session.role !== "admin") {
    redirect(COMMERCE_URLS.HOME);
  }
}
