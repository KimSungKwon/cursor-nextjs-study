"use client";

import type { CSSProperties, HTMLAttributes } from "react";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";

export type QuantitySelectorSize = "sm" | "md";

export interface QuantitySelectorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: number;
  min?: number;
  max?: number;
  size?: QuantitySelectorSize;
  disabled?: boolean;
  onChange?: (value: number) => void;
}

const sizeStyle: Record<QuantitySelectorSize, CSSProperties> = {
  sm: {
    height: 32,
    width: 80,
    borderRadius: 4,
    border: `1px solid ${commerceColors.border.dark}`,
    backgroundColor: commerceColors.background.default,
  },
  md: {
    height: 52,
    width: 127,
    borderRadius: 8,
    backgroundColor: commerceColors.background.light,
  },
};

const iconSize: Record<QuantitySelectorSize, number> = {
  sm: 16,
  md: 20,
};

const valueStyle: Record<QuantitySelectorSize, CSSProperties> = {
  sm: {
    fontSize: commerceTypography.caption.sm.semibold.fontSize,
    fontWeight: commerceTypography.fontWeight.semibold,
    lineHeight: "20px",
  },
  md: {
    fontSize: commerceTypography.body.md.semibold.fontSize,
    fontWeight: commerceTypography.fontWeight.semibold,
    lineHeight: "26px",
  },
};

const MinusIcon = ({ size }: { size: number }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden>
      <path
        d="M4 10h12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

const PlusIcon = ({ size }: { size: number }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden>
      <path
        d="M10 4v12M4 10h12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const QuantitySelector = ({
  value,
  min = 1,
  max,
  size = "sm",
  disabled = false,
  onChange,
  className,
  style,
  ...props
}: QuantitySelectorProps) => {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && (max === undefined || value < max);
  const icon = iconSize[size];

  const step = (next: number) => {
    if (disabled) return;
    if (next < min) return;
    if (max !== undefined && next > max) return;
    onChange?.(next);
  };

  return (
    <div
      role="group"
      aria-label="수량 선택"
      className={cn(
        "inline-flex items-center justify-between px-2",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      style={{
        fontFamily: commerceTypography.fontFamily.body,
        color: commerceColors.text.primary,
        ...sizeStyle[size],
        ...style,
      }}
      {...props}
    >
      <button
        type="button"
        aria-label="수량 감소"
        disabled={!canDecrease}
        className={cn(
          "inline-flex items-center justify-center rounded-sm",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          "disabled:opacity-40",
        )}
        style={{
          color: commerceColors.text.secondary,
          outlineColor: commerceColors.primary.main,
        }}
        onClick={() => step(value - 1)}
      >
        <MinusIcon size={icon} />
      </button>
      <span
        aria-live="polite"
        className="min-w-4 text-center tabular-nums"
        style={valueStyle[size]}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="수량 증가"
        disabled={!canIncrease}
        className={cn(
          "inline-flex items-center justify-center rounded-sm",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          "disabled:opacity-40",
        )}
        style={{
          color: commerceColors.text.secondary,
          outlineColor: commerceColors.primary.main,
        }}
        onClick={() => step(value + 1)}
      >
        <PlusIcon size={icon} />
      </button>
    </div>
  );
};
