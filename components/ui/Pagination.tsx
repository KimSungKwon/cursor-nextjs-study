"use client";

import type { ButtonHTMLAttributes } from "react";
import { adminColors, commerceColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";

export type PaginationVariant = "full" | "compact";

export interface PaginationProps {
  page: number;
  totalPages: number;
  variant?: PaginationVariant;
  className?: string;
  onPageChange: (page: number) => void;
  "aria-label"?: string;
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M10 12L6 8L10 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 4L10 8L6 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface PageButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

function PageButton({
  active,
  className,
  children,
  style,
  ...props
}: PageButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex size-7 items-center justify-center rounded transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      style={{
        fontFamily: adminTypography.fontFamily.body,
        fontSize: adminTypography.body.sm.fontSize,
        lineHeight: "20px",
        outlineColor: commerceColors.primary.main,
        backgroundColor: active
          ? commerceColors.primary.main
          : adminColors.background.light,
        color: active
          ? commerceColors.text.inverse
          : adminColors.text.muted,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function getPageNumbers(page: number, totalPages: number, max = 5): number[] {
  if (totalPages <= max) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const half = Math.floor(max / 2);
  let start = Math.max(1, page - half);
  const end = Math.min(totalPages, start + max - 1);
  start = Math.max(1, end - max + 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function Pagination({
  page,
  totalPages,
  variant = "full",
  className,
  onPageChange,
  "aria-label": ariaLabel = "pagination",
}: PaginationProps) {
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const pages =
    variant === "compact" ? [page] : getPageNumbers(page, totalPages);

  return (
    <nav
      aria-label={ariaLabel}
      className={cn("inline-flex items-center gap-0", className)}
    >
      <PageButton
        aria-label="이전 페이지"
        disabled={!canPrev}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft />
      </PageButton>

      {pages.map((pageNumber) => (
        <PageButton
          key={pageNumber}
          active={pageNumber === page}
          aria-label={`${pageNumber} 페이지`}
          aria-current={pageNumber === page ? "page" : undefined}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </PageButton>
      ))}

      <PageButton
        aria-label="다음 페이지"
        disabled={!canNext}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight />
      </PageButton>
    </nav>
  );
}
