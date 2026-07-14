import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import { adminTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";
import type { AdminBreadcrumb } from "@/components/admin/types";

export interface AdminHeaderProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: AdminBreadcrumb[];
}

export const AdminHeader = ({
  title,
  description,
  actions,
  breadcrumbs,
  className,
  style,
  ...props
}: AdminHeaderProps) => {
  return (
    <header
      className={cn(
        "border-b border-[var(--admin-border-default)] bg-[var(--admin-background-default)] px-6 py-4",
        className,
      )}
      style={style}
      {...props}
    >
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav aria-label="breadcrumb" className="mb-2">
          <ol className="flex flex-wrap items-center gap-1 text-xs">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                  {index > 0 ? (
                    <span
                      aria-hidden
                      style={{ color: "var(--admin-text-muted)" }}
                    >
                      /
                    </span>
                  ) : null}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-primary-main)]"
                      style={{ color: "var(--admin-text-muted)" }}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      style={{
                        color: isLast
                          ? "var(--admin-text-primary)"
                          : "var(--admin-text-muted)",
                      }}
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1
            style={{
              fontFamily: "var(--admin-font-family-heading)",
              fontSize: "var(--admin-heading-h1-font-size)",
              fontWeight: adminTypography.fontWeight.semibold,
              lineHeight: "var(--admin-heading-h1-line-height)",
              color: "var(--admin-text-primary)",
            }}
          >
            {title}
          </h1>
          {description ? (
            <p
              className="mt-1"
              style={{
                fontFamily: "var(--admin-font-family-body)",
                fontSize: "var(--admin-body-md-font-size)",
                color: "var(--admin-text-secondary)",
              }}
            >
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  );
};
