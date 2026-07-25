"use client";

import { useSessionStore } from "@/commons/store/session-store";

/**
 * 로그인 세션 상태를 조회한다.
 */
export const useAuth = () => {
  const user = useSessionStore((state) => state.user);
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const isAdmin = useSessionStore((state) => state.isAdmin);

  return {
    user,
    isAuthenticated,
    isAdmin,
    isSuperAdmin: isAdmin,
    currentUserId: user?.id ?? null,
  };
};
