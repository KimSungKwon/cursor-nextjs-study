"use client";

import type { HTMLAttributes } from "react";
import { adminColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";
import {
  ADMIN_STATUS_LABEL,
  type AdminStatus,
} from "@/components/admin/types";

export interface AdminStatusBadgeProps
  extends HTMLAttributes<HTMLSpanElement> {
  status: AdminStatus;
  label?: string;
}

const statusColor: Record<AdminStatus, string> = {
  active: "#28c76f",
  inactive: adminColors.text.muted,
  pending: adminColors.semantic.warning,
  error: adminColors.semantic.error,
};

export const AdminStatusBadge = ({
  status,
  label,
  className,
  style,
  ...props
}: AdminStatusBadgeProps) => {
  return (
    <span
      className={cn(className)}
      style={{
        fontFamily: "var(--admin-font-family-body)",
        fontSize: "var(--admin-heading-h3-font-size)",
        fontWeight: adminTypography.fontWeight.regular,
        lineHeight: "22px",
        color: statusColor[status],
        ...style,
      }}
      {...props}
    >
      {label ?? ADMIN_STATUS_LABEL[status]}
    </span>
  );
};
