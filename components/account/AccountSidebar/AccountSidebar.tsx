"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import {
  ACCOUNT_URLS,
  ADMIN_URLS,
  AUTH_URLS,
} from "@/commons/constants/url";
import { useAuth } from "@/commons/hooks/useAuth";
import { cn } from "@/commons/utils/cn";

export type AccountSidebarProps = {
  displayName: string | null;
  email: string;
};

type NavItem = {
  label: string;
  href?: string;
  action?: "logout";
};

const NAV_ITEMS: NavItem[] = [
  { label: "Account", href: ACCOUNT_URLS.ACCOUNT },
  { label: "Orders", href: ACCOUNT_URLS.ORDERS },
  { label: "Reviews", href: ACCOUNT_URLS.REVIEWS },
  { label: "Wishlist", href: ACCOUNT_URLS.WISHLIST },
  { label: "Dashboard", href: ADMIN_URLS.DASHBOARD },
  { label: "Log Out", action: "logout" },
];

const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path
      d="M2.5 5.5h2l1-1.5h5l1 1.5h2A1.5 1.5 0 0 1 14 7v5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12V7a1.5 1.5 0 0 1 1.5-1.5Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="9.5" r="2" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

/**
 * 마이페이지 좌측 메뉴 (피그마 MENU 65:4450)
 */
export const AccountSidebar = ({
  displayName,
  email,
}: AccountSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const resolvedName = displayName?.trim() || email.split("@")[0] || "User";
  const initial = resolvedName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push(AUTH_URLS.LOGIN);
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <aside
      className="flex w-full shrink-0 flex-col items-center rounded-lg px-4 pb-10 pt-10 sm:w-[262px]"
      style={{ backgroundColor: commerceColors.background.light }}
      aria-label="계정 메뉴"
    >
      <div className="mb-10 flex flex-col items-center gap-1.5">
        <div className="relative size-[80px]">
          <div
            className="flex size-full items-center justify-center overflow-hidden rounded-full"
            style={{ backgroundColor: commerceColors.primary.main }}
            aria-hidden
          >
            <span
              className="text-2xl font-semibold text-[var(--commerce-text-inverse)]"
              style={{ fontFamily: commerceTypography.fontFamily.body }}
            >
              {initial}
            </span>
          </div>
          <span
            className="absolute bottom-0 right-0 flex size-[30px] items-center justify-center rounded-full border-2 border-white"
            style={{
              backgroundColor: commerceColors.primary.main,
              color: commerceColors.text.inverse,
            }}
            aria-hidden
          >
            <CameraIcon />
          </span>
        </div>

        <p
          className="max-w-[200px] truncate text-center"
          style={{
            fontFamily: commerceTypography.fontFamily.body,
            fontSize: commerceTypography.body.lg.semibold.fontSize,
            fontWeight: commerceTypography.fontWeight.semibold,
            lineHeight: "32px",
            color: commerceColors.text.primary,
          }}
          title={resolvedName}
        >
          {resolvedName}
        </p>
        <p className="sr-only">{email}</p>
      </div>

      <nav className="flex w-full max-w-[230px] flex-col gap-3" aria-label="계정 내비게이션">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href !== undefined &&
            (pathname === item.href ||
              (item.href !== ACCOUNT_URLS.ACCOUNT &&
                pathname.startsWith(item.href)));

          const itemClassName = cn(
            "flex h-[42px] w-full items-center border-b text-left transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2",
          );

          const itemStyle = {
            fontFamily: commerceTypography.fontFamily.body,
            fontSize: commerceTypography.body.md.semibold.fontSize,
            fontWeight: commerceTypography.fontWeight.semibold,
            lineHeight: "26px",
            color: isActive
              ? commerceColors.text.secondary
              : commerceColors.text.tertiary,
            borderColor: isActive
              ? commerceColors.primary.main
              : "transparent",
            outlineColor: commerceColors.primary.main,
          } as const;

          if (item.action === "logout") {
            return (
              <button
                key={item.label}
                type="button"
                className={itemClassName}
                style={itemStyle}
                disabled={isSigningOut}
                onClick={() => {
                  void handleLogout();
                }}
              >
                {isSigningOut ? "Logging out..." : item.label}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href!}
              className={itemClassName}
              style={itemStyle}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
