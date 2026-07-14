"use client";

import type { HTMLAttributes } from "react";
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

const StarIcon = ({
  filled,
  size,
}: {
  filled: boolean;
  size: number;
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M8 1.5l1.76 3.56 3.93.57-2.84 2.77.67 3.92L8 10.48l-3.52 1.84.67-3.92L2.31 5.63l3.93-.57L8 1.5z"
        fill={
          filled
            ? commerceColors.primary.light
            : commerceColors.background.subtle
        }
      />
    </svg>
  );
};

export const RatingStars = ({
  value,
  max = 5,
  size = 16,
  readOnly = true,
  onChange,
  className,
  ...props
}: RatingStarsProps) => {
  const clamped = Math.min(Math.max(value, 0), max);
  const filledCount = Math.floor(clamped);

  return (
    <div
      role={readOnly ? "img" : "radiogroup"}
      aria-label={readOnly ? `별점 ${clamped} / ${max}` : "별점 선택"}
      className={cn("inline-flex items-center gap-0.5", className)}
      {...props}
    >
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const filled = starValue <= filledCount;

        if (readOnly) {
          return <StarIcon key={starValue} filled={filled} size={size} />;
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
            onClick={() => onChange?.(starValue)}
          >
            <StarIcon filled={filled} size={size} />
          </button>
        );
      })}
    </div>
  );
};
