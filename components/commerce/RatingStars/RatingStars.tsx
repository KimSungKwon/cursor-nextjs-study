"use client";

import { useState, type HTMLAttributes } from "react";
import { FaStar } from "react-icons/fa";
import { commerceColors } from "@/commons/constants/color";
import { cn } from "@/commons/utils/cn";

export interface RatingStarsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: number;
  max?: number;
  size?: number;
  readOnly?: boolean;
  onChange?: (value: number) => void;
}

/**
 * 별점 표시/선택 (읽기 전용 또는 hover 미리보기 포함 선택)
 */
export const RatingStars = ({
  value,
  max = 5,
  size = 16,
  readOnly = true,
  onChange,
  className,
  ...props
}: RatingStarsProps) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const clamped = Math.min(Math.max(value, 0), max);
  const displayValue = !readOnly && hoverValue != null ? hoverValue : clamped;
  const filledCount = Math.floor(displayValue);

  return (
    <div
      role={readOnly ? "img" : "radiogroup"}
      aria-label={readOnly ? `별점 ${clamped} / ${max}` : "별점 선택"}
      className={cn("inline-flex items-center gap-0.5", className)}
      onMouseLeave={() => {
        if (!readOnly) {
          setHoverValue(null);
        }
      }}
      {...props}
    >
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const filled = starValue <= filledCount;

        if (readOnly) {
          return (
            <FaStar
              key={starValue}
              size={size}
              color={
                filled
                  ? commerceColors.primary.light
                  : commerceColors.background.subtle
              }
              aria-hidden
              className="shrink-0"
            />
          );
        }

        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={starValue === Math.round(clamped)}
            aria-label={`${starValue}점`}
            className={cn(
              "rounded-sm p-0.5 transition-opacity",
              "focus-visible:outline-2 focus-visible:outline-offset-2",
            )}
            style={{ outlineColor: commerceColors.primary.main }}
            onMouseEnter={() => setHoverValue(starValue)}
            onFocus={() => setHoverValue(starValue)}
            onClick={() => onChange?.(starValue)}
          >
            <FaStar
              size={size}
              color={
                filled
                  ? commerceColors.primary.light
                  : commerceColors.background.subtle
              }
              aria-hidden
              className="shrink-0"
            />
          </button>
        );
      })}
    </div>
  );
};
