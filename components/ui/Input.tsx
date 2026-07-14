import type { InputHTMLAttributes, ReactNode } from "react";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";

export type InputVariant = "default" | "withIcon" | "search";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  variant?: InputVariant;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = ({
  className,
  id,
  label,
  error,
  variant = "default",
  leftIcon,
  rightIcon,
  disabled,
  style,
  ...props
}: InputProps) => {
  const inputId = id ?? props.name;

  return (
    <div className="flex w-full flex-col gap-2">
      {label ? (
        <label
          htmlFor={inputId}
          className="uppercase tracking-wide"
          style={{
            fontFamily: commerceTypography.fontFamily.body,
            fontSize: commerceTypography.caption.sm.bold.fontSize,
            fontWeight: commerceTypography.fontWeight.bold,
            lineHeight: "12px",
            color: commerceColors.text.tertiary,
          }}
        >
          {label}
        </label>
      ) : null}
      <div
        className={cn(
          "flex h-10 items-center gap-2 rounded-md border px-4 transition-colors",
          disabled && "opacity-50",
          variant === "search" && "rounded-lg",
          className,
        )}
        style={{
          backgroundColor: commerceColors.background.default,
          borderColor: error
            ? commerceColors.semantic.error
            : commerceColors.border.dark,
        }}
      >
        {leftIcon ? (
          <span
            className="shrink-0"
            style={{ color: commerceColors.text.tertiary }}
            aria-hidden
          >
            {leftIcon}
          </span>
        ) : null}
        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error && inputId ? `${inputId}-error` : undefined}
          className={cn(
            "h-full w-full bg-transparent outline-none",
            "placeholder:text-[color:var(--input-placeholder)]",
            "disabled:cursor-not-allowed",
          )}
          style={{
            fontFamily: commerceTypography.fontFamily.body,
            fontSize: commerceTypography.body.md.regular.fontSize,
            lineHeight: "26px",
            color: commerceColors.text.secondary,
            ["--input-placeholder" as string]: commerceColors.text.tertiary,
            ...style,
          }}
          {...props}
        />
        {rightIcon ? (
          <span
            className="shrink-0"
            style={{ color: commerceColors.text.tertiary }}
            aria-hidden
          >
            {rightIcon}
          </span>
        ) : null}
      </div>
      {error ? (
        <p
          id={inputId ? `${inputId}-error` : undefined}
          role="alert"
          style={{
            fontSize: commerceTypography.caption.sm.regular.fontSize,
            color: commerceColors.semantic.error,
          }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
};
