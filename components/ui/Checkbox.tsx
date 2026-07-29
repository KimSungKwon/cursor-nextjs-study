"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  error?: string;
}

export const Checkbox = ({
  id,
  name,
  label,
  error,
  className,
  disabled,
  checked,
  ...props
}: CheckboxProps) => {
  const inputId = id ?? name;

  return (
    <div className="flex w-full flex-col gap-2">
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex cursor-pointer items-start gap-3",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        <span className="relative mt-0.5 inline-flex size-6 shrink-0">
          <input
            id={inputId}
            name={name}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              error && inputId ? `${inputId}-error` : undefined
            }
            className={cn(
              "peer size-6 appearance-none rounded border bg-[var(--commerce-background-paper)] transition-colors",
              "checked:border-[var(--commerce-primary-main)] checked:bg-[var(--commerce-primary-main)]",
              "focus-visible:outline-2 focus-visible:outline-offset-2",
              "disabled:cursor-not-allowed",
            )}
            style={{
              borderColor: error
                ? commerceColors.semantic.error
                : commerceColors.border.dark,
              outlineColor: commerceColors.primary.main,
            }}
            {...props}
          />
          <svg
            className="pointer-events-none absolute inset-0 m-auto hidden size-3.5 text-[var(--commerce-text-inverse)] peer-checked:block"
            viewBox="0 0 16 16"
            aria-hidden
          >
            <path
              d="M3.5 8.5l3 3 6-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {label ? (
          <span
            style={{
              fontFamily: commerceTypography.fontFamily.body,
              fontSize: commerceTypography.body.md.regular.fontSize,
              fontWeight: commerceTypography.fontWeight.regular,
              lineHeight: "26px",
              color: commerceColors.text.tertiary,
            }}
          >
            {label}
          </span>
        ) : null}
      </label>
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
