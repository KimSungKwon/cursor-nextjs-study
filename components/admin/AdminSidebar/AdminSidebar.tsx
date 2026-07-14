"use client";

import Link from "next/link";
import type { HTMLAttributes } from "react";
import { adminColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";
import type {
  AdminSidebarItem,
  AdminSidebarSection,
} from "@/components/admin/types";

export interface AdminSidebarProps extends HTMLAttributes<HTMLElement> {
  logoText?: string;
  sections: AdminSidebarSection[];
  activeId?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: (id: string, href: string) => void;
}

const CollapseIcon = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16M4 12h10M4 18h16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

const MenuItem = ({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: AdminSidebarItem;
  active: boolean;
  collapsed?: boolean;
  onNavigate?: (id: string, href: string) => void;
}) => {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-10 items-center gap-3 rounded-md px-4 transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-[var(--admin-primary-main)]",
        collapsed && "justify-center px-2",
      )}
      style={{
        backgroundColor: active
          ? adminColors.background.light
          : "transparent",
        color: active ? "#23272e" : "var(--admin-text-muted)",
        fontFamily: "var(--admin-font-family-body)",
        fontSize: "15px",
        fontWeight: active
          ? adminTypography.fontWeight.semibold
          : adminTypography.fontWeight.regular,
        lineHeight: "22px",
      }}
      onClick={() => onNavigate?.(item.id, item.href)}
    >
      {item.icon ? (
        <span className="inline-flex size-[22px] shrink-0 items-center justify-center">
          {item.icon}
        </span>
      ) : null}
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {item.badgeCount != null ? (
            <span
              className="inline-flex size-[22px] items-center justify-center rounded-full text-[13px] font-semibold"
              style={{
                backgroundColor: "rgba(115, 103, 240, 0.16)",
                color: "#7367f0",
              }}
            >
              {item.badgeCount}
            </span>
          ) : null}
        </>
      ) : null}
    </Link>
  );
};

export const AdminSidebar = ({
  logoText = "Cursor Commerce",
  sections,
  activeId,
  collapsed = false,
  onToggleCollapse,
  onNavigate,
  className,
  style,
  ...props
}: AdminSidebarProps) => {
  return (
    <aside
      aria-label="관리자 메뉴"
      className={cn(
        "flex h-full flex-col bg-[var(--admin-background-default)]",
        collapsed ? "w-20" : "w-[260px]",
        className,
      )}
      style={style}
      {...props}
    >
      <div className="flex h-16 items-center justify-between px-[18px]">
        {!collapsed ? (
          <p
            className="truncate"
            style={{
              fontFamily: "var(--commerce-font-family-heading)",
              fontSize: "20px",
              fontWeight: adminTypography.fontWeight.medium,
              lineHeight: "24px",
              color: "#23272e",
            }}
          >
            {logoText}
          </p>
        ) : (
          <span className="sr-only">{logoText}</span>
        )}
        {onToggleCollapse ? (
          <button
            type="button"
            aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
            className={cn(
              "inline-flex size-6 items-center justify-center rounded",
              "text-[var(--admin-text-muted)]",
              "focus-visible:outline-2 focus-visible:outline-offset-2",
              "focus-visible:outline-[var(--admin-primary-main)]",
            )}
            onClick={onToggleCollapse}
          >
            <CollapseIcon />
          </button>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto pb-6">
        {sections.map((section) => (
          <div key={section.id} className="mt-2">
            {!collapsed ? (
              <p
                className="px-[30px] py-3 text-[11px] leading-[14px]"
                style={{
                  fontFamily: "var(--admin-font-family-body)",
                  color: "var(--admin-text-muted)",
                }}
              >
                {section.title}
              </p>
            ) : null}
            <ul className="flex flex-col gap-2 px-3.5">
              {section.items.map((item) => (
                <li key={item.id}>
                  <MenuItem
                    item={item}
                    active={item.id === activeId}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};
