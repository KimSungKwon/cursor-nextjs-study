"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/commons/utils/cn";
import { Dropdown } from "@/components/ui/Dropdown";
import { SearchInput } from "@/components/ui/SearchInput";
import type { AdminFilterOption } from "@/components/admin/types";

export interface AdminFilterBarProps extends HTMLAttributes<HTMLDivElement> {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  dateRangeLabel?: string;
  dateRangeOptions?: AdminFilterOption[];
  dateRangeValue?: string;
  onDateRangeChange?: (value: string) => void;
  extraFilters?: ReactNode;
}

export const AdminFilterBar = ({
  searchPlaceholder = "Search by order id",
  searchValue,
  onSearchChange,
  dateRangeLabel = "Filter by date range",
  dateRangeOptions = [],
  dateRangeValue,
  onDateRangeChange,
  extraFilters,
  className,
  style,
  ...props
}: AdminFilterBarProps) => {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-3", className)}
      style={style}
      {...props}
    >
      <SearchInput
        variant="admin"
        className="max-w-[200px]"
        placeholder={searchPlaceholder}
        value={searchValue}
        aria-label={searchPlaceholder}
        onChange={(event) => onSearchChange?.(event.target.value)}
      />
      {dateRangeOptions.length > 0 ? (
        <Dropdown
          className="w-[199px]"
          placeholder={dateRangeLabel}
          options={dateRangeOptions}
          value={dateRangeValue}
          onChange={onDateRangeChange}
          aria-label={dateRangeLabel}
        />
      ) : null}
      {extraFilters}
    </div>
  );
};
