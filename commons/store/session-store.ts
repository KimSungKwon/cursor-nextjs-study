import { create } from "zustand";

// Supabase users 테이블의 user_role enum과 매핑
export type UserRole = "user" | "admin";

// 로그인한 사용자 세션 정보 (users 테이블과 매핑)
export interface UserSession {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
}

export interface SessionState {
  user: UserSession | null;
  isAuthenticated: boolean; // user !== null
  isAdmin: boolean; // user?.role === "admin"
  setUser: (user: UserSession) => void;
  clearUser: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,

  // 로그인 사용자 설정 + 파생 상태(isAuthenticated/isAdmin) 갱신
  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
      isAdmin: user.role === "admin",
    }),

  // 로그아웃: 세션 및 파생 상태 초기화
  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    }),
}));
