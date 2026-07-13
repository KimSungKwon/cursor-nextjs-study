import type { ButtonHTMLAttributes, ReactNode } from "react";
import { commerceColors } from "@/commons/constants/color";
import { cn } from "@/commons/utils/cn";

export type IconButtonVariant = "plain" | "circle";
export type IconButtonSize = "sm" | "md";

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** 접근성용 필수 라벨 */
  "aria-label": string;
  children: ReactNode;
}

const sizeClass: Record<IconButtonSize, string> = {
  sm: "size-6",
  md: "size-8",
};

export function IconButton({
  className,
  variant = "plain",
  size = "md",
  children,
  type = "button",
  style,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "circle" && "rounded-full shadow-sm",
        variant === "plain" && "rounded-md",
        sizeClass[size],
        className,
      )}
      style={{
        color: commerceColors.text.secondary,
        outlineColor: commerceColors.primary.main,
        backgroundColor:
          variant === "circle" ? commerceColors.background.default : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
