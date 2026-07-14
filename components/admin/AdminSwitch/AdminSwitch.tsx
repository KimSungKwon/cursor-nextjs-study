"use client";

import type { ButtonHTMLAttributes } from "react";
import { adminColors } from "@/commons/constants/color";
import { cn } from "@/commons/utils/cn";

export interface AdminSwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  "aria-label": string;
}

export const AdminSwitch = ({
  checked,
  onChange,
  disabled = false,
  className,
  style,
  ...props
}: AdminSwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      style={{
        backgroundColor: checked
          ? adminColors.grey[700]
          : adminColors.border.default,
        outlineColor: "var(--admin-primary-main)",
        ...style,
      }}
      onClick={() => onChange?.(!checked)}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-[var(--admin-background-default)] transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
};
