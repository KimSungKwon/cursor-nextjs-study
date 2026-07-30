"use client";

import { useEffect, type ReactNode } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { useSessionStore } from "@/commons/store/session-store";
import {
  mapAuthUserToSession,
  mapUsersRowToSession,
} from "@/lib/auth/map-user-session";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthProviderProps = {
  children: ReactNode;
};

type UsersRow = {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
};

/**
 * Supabase Auth 세션을 useSessionStore와 동기화한다.
 * 로그인/로그아웃/새로고침 시 zustand 상태를 최신으로 유지한다.
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const setUser = useSessionStore((state) => state.setUser);
  const clearUser = useSessionStore((state) => state.clearUser);
  const setLoading = useSessionStore((state) => state.setLoading);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let isMounted = true;

    const syncUserSession = async (authUser: User | null) => {
      if (!authUser) {
        if (isMounted) {
          clearUser();
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("id, email, display_name, role")
        .eq("id", authUser.id)
        .maybeSingle();

      if (!isMounted) return;

      if (error || !data) {
        setUser(mapAuthUserToSession(authUser));
      } else {
        setUser(mapUsersRowToSession(data as UsersRow));
      }

      setLoading(false);
    };

    const initialize = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await syncUserSession(session?.user ?? null);
    };

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        // onAuthStateChange 콜백 내 추가 await 데드락 방지
        setTimeout(() => {
          void syncUserSession(session?.user ?? null);
        }, 0);
      },
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [clearUser, setLoading, setUser]);

  return children;
};
