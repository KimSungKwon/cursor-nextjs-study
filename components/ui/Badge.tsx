import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";

export type BadgeVariant = "neutral" | "success" | "sale" | "new";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
}

const variantStyle: Record<BadgeVariant, CSSProperties> = {
  neutral: {
    backgroundColor: commerceColors.background.default,
    color: commerceColors.text.secondary,
  },
  new: {
    backgroundColor: commerceColors.background.default,
    color: commerceColors.text.secondary,
  },
  success: {
    backgroundColor: commerceColors.semantic.success,
    color: commerceColors.text.inverse,
  },
  sale: {
    backgroundColor: commerceColors.semantic.success,
    color: commerceColors.text.inverse,
  },
};

const sizeStyle: Record<BadgeSize, CSSProperties> = {
  sm: {
    height: 20,
    paddingInline: 8,
    fontSize: commerceTypography.caption.sm.bold.fontSize,
  },
  md: {
    height: 24,
    paddingInline: 14,
    fontSize: commerceTypography.body.md.bold.fontSize,
  },
};

export function Badge({
  className,
  variant = "neutral",
  size = "md",
  children,
  style,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded leading-4",
        className,
      )}
      style={{
        fontFamily: commerceTypography.fontFamily.body,
        fontWeight: commerceTypography.fontWeight.bold,
        ...variantStyle[variant],
        ...sizeStyle[size],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
