import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";

export type ButtonVariant = "solid" | "outline" | "ghost" | "pill";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const sizeStyle: Record<ButtonSize, CSSProperties> = {
  xs: {
    height: 36,
    paddingInline: 12,
    fontSize: commerceTypography.button.xs.fontSize,
    lineHeight: commerceTypography.button.xs.lineHeight,
  },
  sm: {
    height: 40,
    paddingInline: 16,
    fontSize: commerceTypography.button.sm.fontSize,
    lineHeight: commerceTypography.button.sm.lineHeight,
  },
  md: {
    height: 48,
    paddingInline: 20,
    fontSize: commerceTypography.button.md.fontSize,
    lineHeight: commerceTypography.button.md.lineHeight,
  },
  lg: {
    height: 52,
    paddingInline: 24,
    fontSize: commerceTypography.button.sm.fontSize,
    lineHeight: "28px",
  },
  xl: {
    height: 56,
    paddingInline: 32,
    fontSize: commerceTypography.button.lg.fontSize,
    lineHeight: commerceTypography.button.lg.lineHeight,
  },
};

type VariantTokenStyle = CSSProperties & {
  "--btn-bg": string;
  "--btn-fg": string;
  "--btn-bg-hover": string;
  "--btn-border"?: string;
};

const variantStyle: Record<ButtonVariant, VariantTokenStyle> = {
  solid: {
    "--btn-bg": commerceColors.primary.main,
    "--btn-fg": commerceColors.text.inverse,
    "--btn-bg-hover": commerceColors.primary.dark,
  },
  outline: {
    "--btn-bg": "transparent",
    "--btn-fg": commerceColors.text.secondary,
    "--btn-bg-hover": commerceColors.background.light,
    "--btn-border": commerceColors.primary.main,
  },
  ghost: {
    "--btn-bg": "transparent",
    "--btn-fg": commerceColors.text.secondary,
    "--btn-bg-hover": commerceColors.background.light,
  },
  pill: {
    "--btn-bg": commerceColors.primary.main,
    "--btn-fg": commerceColors.text.inverse,
    "--btn-bg-hover": commerceColors.primary.dark,
    borderRadius: 9999,
  },
};

export function Button({
  className,
  variant = "solid",
  size = "lg",
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  children,
  type = "button",
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const tokens = variantStyle[variant];

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-colors",
        "bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:bg-[var(--btn-bg-hover)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "outline" && "border border-[var(--btn-border)]",
        variant !== "pill" && "rounded-lg",
        className,
      )}
      style={{
        fontFamily: commerceTypography.fontFamily.body,
        fontWeight: commerceTypography.fontWeight.medium,
        letterSpacing: "-0.4px",
        outlineColor: commerceColors.primary.main,
        ...sizeStyle[size],
        ...tokens,
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden
        />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
