"use client";

import { useSessionStore } from "@/commons/store/session-store";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Supabase Auth와 동기화된 로그인 세션 상태를 조회한다.
 */
export const useAuth = () => {
  const user = useSessionStore((state) => state.user);
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const isAdmin = useSessionStore((state) => state.isAdmin);
  const isLoading = useSessionStore((state) => state.isLoading);
  const clearUser = useSessionStore((state) => state.clearUser);

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    clearUser();
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    isSuperAdmin: isAdmin,
    currentUserId: user?.id ?? null,
    isLoading,
    signOut,
  };
};
