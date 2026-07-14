"use client";

import type { HTMLAttributes } from "react";
import { adminTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";
import { Dropdown } from "@/components/ui/Dropdown";
import { Pagination } from "@/components/ui/Pagination";

export interface AdminTablePaginationProps
  extends HTMLAttributes<HTMLDivElement> {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export const AdminTablePagination = ({
  page,
  totalPages,
  pageSize,
  totalItems,
  pageSizeOptions = [10, 25, 50],
  onPageChange,
  onPageSizeChange,
  className,
  style,
  ...props
}: AdminTablePaginationProps) => {
  return (
    <div
      className={cn(
        "flex min-h-[70px] w-full flex-wrap items-center justify-between gap-4 px-6 py-4",
        className,
      )}
      style={{
        fontFamily: "var(--admin-font-family-body)",
        ...style,
      }}
      {...props}
    >
      <div
        className="flex items-center gap-2"
        style={{
          color: "var(--admin-text-muted)",
          fontSize: "15px",
          fontWeight: adminTypography.fontWeight.medium,
        }}
      >
        <span>Showing</span>
        <Dropdown
          aria-label="페이지당 항목 수"
          className="w-[78px]"
          value={String(pageSize)}
          options={pageSizeOptions.map((size) => ({
            value: String(size),
            label: String(size),
          }))}
          onChange={(value) => onPageSizeChange?.(Number(value))}
        />
        <span>of {totalItems}</span>
      </div>

      {onPageChange ? (
        <Pagination
          page={page}
          totalPages={Math.max(totalPages, 1)}
          onPageChange={onPageChange}
        />
      ) : null}
    </div>
  );
};
