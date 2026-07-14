import type { ReactNode } from "react";

export type AdminStatus = "active" | "inactive" | "pending" | "error";

export interface AdminTableColumn<T> {
  id: string;
  header: string;
  width?: number | string;
  align?: "left" | "center" | "right";
  cell: (row: T) => ReactNode;
}

export interface AdminMetric {
  id: string;
  title: string;
  value: string | number;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
}

export interface AdminSidebarItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  badgeCount?: number;
  children?: AdminSidebarItem[];
}

export interface AdminSidebarSection {
  id: string;
  title: string;
  items: AdminSidebarItem[];
}

export interface AdminBreadcrumb {
  label: string;
  href?: string;
}

export interface AdminFilterOption {
  value: string;
  label: string;
}

export const ADMIN_STATUS_LABEL: Record<AdminStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  pending: "Pending",
  error: "Error",
};
