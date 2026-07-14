import type { HTMLAttributes, ReactNode } from "react";
import { adminColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";

export interface AdminMetricCardProps extends HTMLAttributes<HTMLElement> {
  title: string;
  value: string | number;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  icon?: ReactNode;
}

const deltaColor = {
  up: adminColors.semantic.success,
  down: adminColors.semantic.error,
  neutral: adminColors.text.muted,
} as const;

export const AdminMetricCard = ({
  title,
  value,
  delta,
  deltaTone = "neutral",
  icon,
  className,
  style,
  ...props
}: AdminMetricCardProps) => {
  return (
    <article
      className={cn(
        "flex min-w-[200px] flex-1 flex-col gap-3 rounded-xl border border-[var(--admin-border-default)] bg-[var(--admin-background-default)] p-5",
        className,
      )}
      style={style}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          style={{
            fontFamily: "var(--admin-font-family-body)",
            fontSize: "var(--admin-body-sm-font-size)",
            color: "var(--admin-text-muted)",
            fontWeight: adminTypography.fontWeight.medium,
          }}
        >
          {title}
        </p>
        {icon ? (
          <span
            className="inline-flex size-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p
        style={{
          fontFamily: "var(--admin-font-family-heading)",
          fontSize: "var(--admin-heading-h1-font-size)",
          fontWeight: adminTypography.fontWeight.semibold,
          color: "var(--admin-text-primary)",
          lineHeight: "var(--admin-heading-h1-line-height)",
        }}
      >
        {value}
      </p>
      {delta ? (
        <p
          style={{
            fontFamily: "var(--admin-font-family-body)",
            fontSize: "var(--admin-body-xs-font-size)",
            color: deltaColor[deltaTone],
            fontWeight: adminTypography.fontWeight.medium,
          }}
        >
          {delta}
        </p>
      ) : null}
    </article>
  );
};
