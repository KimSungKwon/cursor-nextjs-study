import type { HTMLAttributes } from "react";
import {
  formatPaymentStatusLabel,
  type PaymentStatus,
} from "@/components/account/orders/types";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";

export type PaymentStatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  status: PaymentStatus;
  label?: string;
};

const statusColor: Record<PaymentStatus, string> = {
  succeeded: commerceColors.semantic.success,
  pending: commerceColors.semantic.warning,
  failed: commerceColors.semantic.error,
  cancelled: commerceColors.text.tertiary,
};

/**
 * 결제 상태 배지
 */
export const PaymentStatusBadge = ({
  status,
  label,
  className,
  style,
  ...props
}: PaymentStatusBadgeProps) => {
  return (
    <span
      className={cn("inline-flex items-center", className)}
      style={{
        fontFamily: commerceTypography.fontFamily.body,
        fontSize: commerceTypography.caption.md.regular.fontSize,
        fontWeight: commerceTypography.fontWeight.regular,
        lineHeight: "22px",
        color: statusColor[status],
        ...style,
      }}
      {...props}
    >
      {label ?? formatPaymentStatusLabel(status)}
    </span>
  );
};
