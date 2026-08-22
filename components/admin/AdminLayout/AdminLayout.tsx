"use client";

import type { ReactNode } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar/AdminSidebar";

export type AdminLayoutProps = {
  children: ReactNode;
  email: string;
};

/**
 * Admin 공통 레이아웃 — 헤더 고정 + 사이드바 + 메인 스크롤
 */
export const AdminLayout = ({ children, email }: AdminLayoutProps) => {
  return (
    <div
      className="flex h-screen flex-col"
      style={{ backgroundColor: "var(--admin-background-paper)" }}
    >
      <AdminHeader email={email} />
      <div className="flex min-h-0 flex-1">
        <AdminSidebar />
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
