import type { HTMLAttributes } from "react";
import {
  formatOrderStatusLabel,
  type OrderStatus,
} from "@/components/account/orders/types";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";

export type OrderStatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  status: OrderStatus;
  label?: string;
};

const statusColor: Record<OrderStatus, string> = {
  paid: commerceColors.semantic.success,
  pending: commerceColors.semantic.warning,
  canceled: commerceColors.semantic.error,
  refunded: commerceColors.text.tertiary,
};

/**
 * 주문 상태 배지
 */
export const OrderStatusBadge = ({
  status,
  label,
  className,
  style,
  ...props
}: OrderStatusBadgeProps) => {
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
      {label ?? formatOrderStatusLabel(status)}
    </span>
  );
};
