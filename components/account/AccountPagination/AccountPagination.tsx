import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";

export type AccountPaginationProps = {
  page: number;
  totalPages: number;
  basePath?: string;
  className?: string;
  "aria-label"?: string;
};

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

function buildPageHref(basePath: string, pageNumber: number): string {
  if (pageNumber <= 1) {
    return basePath;
  }
  return `${basePath}?page=${pageNumber}`;
}

/**
 * 계정 영역용 페이지네이션 (피그마 Pagination 303:2564)
 */
export const AccountPagination = ({
  page,
  totalPages,
  basePath = ACCOUNT_URLS.WISHLIST,
  className,
  "aria-label": ariaLabel = "페이지네이션",
}: AccountPaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const canPrev = page > 1;
  const canNext = page < totalPages;
  const pages = getPageNumbers(page, totalPages);

  const cellClassName = cn(
    "inline-flex size-7 items-center justify-center rounded transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2",
  );

  return (
    <nav
      aria-label={ariaLabel}
      className={cn("flex w-full items-center justify-center gap-0.5", className)}
    >
      {canPrev ? (
        <Link
          href={buildPageHref(basePath, page - 1)}
          aria-label="이전 페이지"
          className={cellClassName}
          style={{
            backgroundColor: commerceColors.background.light,
            color: commerceColors.text.tertiary,
            outlineColor: commerceColors.primary.main,
          }}
        >
          <FaChevronLeft size={12} aria-hidden />
        </Link>
      ) : (
        <span
          aria-disabled
          className={cn(cellClassName, "pointer-events-none opacity-40")}
          style={{
            backgroundColor: commerceColors.background.light,
            color: commerceColors.text.tertiary,
          }}
        >
          <FaChevronLeft size={12} aria-hidden />
        </span>
      )}

      {pages.map((pageNumber) => {
        const isActive = pageNumber === page;
        const style = {
          fontFamily: commerceTypography.fontFamily.body,
          fontSize: "13px",
          lineHeight: "20px",
          outlineColor: commerceColors.primary.main,
          backgroundColor: isActive
            ? commerceColors.primary.main
            : commerceColors.background.light,
          color: isActive
            ? commerceColors.text.inverse
            : commerceColors.text.tertiary,
        } as const;

        if (isActive) {
          return (
            <span
              key={pageNumber}
              aria-current="page"
              className={cellClassName}
              style={style}
            >
              {pageNumber}
            </span>
          );
        }

        return (
          <Link
            key={pageNumber}
            href={buildPageHref(basePath, pageNumber)}
            aria-label={`${pageNumber} 페이지`}
            className={cellClassName}
            style={style}
          >
            {pageNumber}
          </Link>
        );
      })}

      {canNext ? (
        <Link
          href={buildPageHref(basePath, page + 1)}
          aria-label="다음 페이지"
          className={cellClassName}
          style={{
            backgroundColor: commerceColors.background.light,
            color: commerceColors.text.tertiary,
            outlineColor: commerceColors.primary.main,
          }}
        >
          <FaChevronRight size={12} aria-hidden />
        </Link>
      ) : (
        <span
          aria-disabled
          className={cn(cellClassName, "pointer-events-none opacity-40")}
          style={{
            backgroundColor: commerceColors.background.light,
            color: commerceColors.text.tertiary,
          }}
        >
          <FaChevronRight size={12} aria-hidden />
        </span>
      )}
    </nav>
  );
};
