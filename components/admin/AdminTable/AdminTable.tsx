"use client";

import type { CSSProperties, HTMLAttributes, KeyboardEvent } from "react";
import { adminColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";
import type { AdminTableColumn } from "@/components/admin/types";

export interface AdminTableProps<T> extends HTMLAttributes<HTMLDivElement> {
  columns: AdminTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

const alignStyle = (
  align?: "left" | "center" | "right",
): CSSProperties["textAlign"] => align ?? "left";

export const AdminTable = <T,>({
  columns,
  rows,
  rowKey,
  isLoading = false,
  emptyMessage = "데이터가 없습니다.",
  onRowClick,
  className,
  style,
  ...props
}: AdminTableProps<T>) => {
  return (
    <div
      className={cn("w-full overflow-x-auto", className)}
      style={style}
      {...props}
    >
      <table
        className="w-full border-collapse"
        style={{
          fontFamily: "var(--admin-font-family-body)",
          minWidth: 720,
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: `1px solid ${adminColors.border.default}`,
              height: 47,
            }}
          >
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className="px-5 text-left"
                style={{
                  width: column.width,
                  textAlign: alignStyle(column.align),
                  color: "var(--admin-text-muted)",
                  fontSize: "var(--admin-body-sm-font-size)",
                  fontWeight: adminTypography.fontWeight.medium,
                  lineHeight: "15px",
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }, (_, index) => (
              <tr key={`skeleton-${index}`} style={{ height: 50 }}>
                {columns.map((column) => (
                  <td key={column.id} className="px-5">
                    <div
                      className="h-4 w-24 animate-pulse rounded"
                      style={{
                        backgroundColor: "var(--admin-background-light)",
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-10 text-center"
                style={{
                  color: "var(--admin-text-muted)",
                  fontSize: "var(--admin-body-md-font-size)",
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const handleActivate = () => onRowClick?.(row);
              const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
                if (!onRowClick) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onRowClick(row);
                }
              };

              return (
                <tr
                  key={rowKey(row)}
                  tabIndex={onRowClick ? 0 : undefined}
                  className={cn(
                    "transition-colors",
                    onRowClick && "cursor-pointer",
                    "focus-visible:outline-2 focus-visible:outline-offset-[-2px]",
                    "focus-visible:outline-[var(--admin-primary-main)]",
                  )}
                  style={{
                    height: 50,
                    borderBottom: `1px solid ${adminColors.border.default}`,
                    color: "#23272e",
                  }}
                  onClick={handleActivate}
                  onKeyDown={handleKeyDown}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.backgroundColor =
                      adminColors.background.paper;
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className="px-5"
                      style={{
                        width: column.width,
                        textAlign: alignStyle(column.align),
                        fontSize: "15px",
                        lineHeight: "22px",
                        fontWeight: adminTypography.fontWeight.regular,
                      }}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
