import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { adminColors, commerceColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";

export type StatusTextVariant = "active" | "inactive" | "pending";

export interface StatusTextProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: StatusTextVariant;
  children: ReactNode;
}

const variantStyle: Record<StatusTextVariant, CSSProperties> = {
  active: { color: adminColors.semantic.success },
  inactive: { color: adminColors.text.muted },
  pending: { color: commerceColors.semantic.warning },
};

export function StatusText({
  className,
  variant = "active",
  children,
  style,
  ...props
}: StatusTextProps) {
  return (
    <span
      className={cn(className)}
      style={{
        fontFamily: adminTypography.fontFamily.body,
        fontSize: adminTypography.heading.h3.fontSize,
        lineHeight: "22px",
        ...variantStyle[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
