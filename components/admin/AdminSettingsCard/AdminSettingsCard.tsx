"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { adminTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";
import { AdminSwitch } from "@/components/admin/AdminSwitch/AdminSwitch";

export interface AdminSettingsCardProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: string;
  description?: string;
  icon?: ReactNode;
  enabled: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  children?: ReactNode;
}

export const AdminSettingsCard = ({
  title,
  description,
  icon,
  enabled,
  onEnabledChange,
  children,
  className,
  style,
  ...props
}: AdminSettingsCardProps) => {
  return (
    <section
      className={cn(
        "w-full max-w-[1128px] rounded-xl border border-[var(--admin-border-default)] bg-[var(--admin-background-default)] p-6",
        className,
      )}
      style={style}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          {icon ? (
            <span
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
            >
              {icon}
            </span>
          ) : null}
          <div className="min-w-0">
            <h2
              style={{
                fontFamily: "var(--commerce-font-family-heading)",
                fontSize: "16px",
                fontWeight: adminTypography.fontWeight.semibold,
                lineHeight: "24px",
                color: "#111827",
              }}
            >
              {title}
            </h2>
            {description ? (
              <p
                className="mt-0.5"
                style={{
                  fontFamily: "var(--commerce-font-family-heading)",
                  fontSize: "14px",
                  fontWeight: adminTypography.fontWeight.medium,
                  lineHeight: "20px",
                  color: "#6b7280",
                }}
              >
                {description}
              </p>
            ) : null}
          </div>
        </div>
        <AdminSwitch
          checked={enabled}
          onChange={onEnabledChange}
          aria-label={`${title} 사용 설정`}
        />
      </div>
      {enabled && children ? (
        <div className="mt-6 pl-14">{children}</div>
      ) : null}
    </section>
  );
};
