import type { HTMLAttributes } from "react";
import { cn } from "@/commons/utils/cn";

export type LoadingSpinnerSize = "sm" | "md" | "lg";

export interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: LoadingSpinnerSize;
}

const sizeClass: Record<LoadingSpinnerSize, string> = {
  sm: "size-4 border-2",
  md: "size-8 border-2",
  lg: "size-10 border-[3px]",
};

/**
 * 추가 페이지 로딩 중임을 표시하는 스피너
 */
export const LoadingSpinner = ({
  className,
  size = "md",
  ...props
}: LoadingSpinnerProps) => {
  return (
    <div
      role="status"
      aria-label="로딩 중"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center py-8",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-[var(--commerce-primary-main)] border-r-transparent",
          sizeClass[size],
        )}
      />
    </div>
  );
};
