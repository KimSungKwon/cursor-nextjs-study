"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { COMMERCE_URLS } from "@/commons/constants/url";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type AdminHeaderProps = {
  email: string;
};

/**
 * Admin 공통 상단 헤더
 */
export const AdminHeader = ({ email }: AdminHeaderProps) => {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push(COMMERCE_URLS.HOME);
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header
      className="flex h-16 shrink-0 items-center justify-between border-b px-6"
      style={{
        backgroundColor: "var(--admin-background-default)",
        borderColor: "var(--admin-border-default)",
      }}
    >
      <div className="flex min-w-0 items-center gap-6">
        <p
          className="truncate"
          style={{
            fontFamily: "var(--admin-font-family-heading)",
            fontSize: "20px",
            fontWeight: 500,
            lineHeight: "24px",
            color: "var(--admin-text-primary)",
          }}
        >
          Cursor Admin
        </p>
        <Link
          href={COMMERCE_URLS.HOME}
          className="transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            fontFamily: "var(--admin-font-family-body)",
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: "22px",
            color: "var(--admin-primary-main)",
            outlineColor: "var(--admin-primary-main)",
          }}
        >
          쇼핑몰 이동
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <span
          className="hidden max-w-[240px] truncate sm:inline"
          style={{
            fontFamily: "var(--admin-font-family-body)",
            fontSize: "14px",
            lineHeight: "22px",
            color: "var(--admin-text-secondary)",
          }}
          title={email}
        >
          {email}
        </span>
        <button
          type="button"
          disabled={isSigningOut}
          onClick={() => {
            void handleLogout();
          }}
          className="rounded-md px-3 py-1.5 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
          style={{
            fontFamily: "var(--admin-font-family-body)",
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: "22px",
            color: "var(--admin-text-primary)",
            backgroundColor: "var(--admin-background-light)",
            outlineColor: "var(--admin-primary-main)",
          }}
        >
          {isSigningOut ? "로그아웃 중..." : "로그아웃"}
        </button>
      </div>
    </header>
  );
};
