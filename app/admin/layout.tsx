"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ADMIN_URLS } from "@/commons/constants/url";
import { AdminLayout } from "@/components/admin/AdminLayout/AdminLayout";
import { AdminSidebar } from "@/components/admin/AdminSidebar/AdminSidebar";
import type { AdminSidebarSection } from "@/components/admin/types";

const adminSections: AdminSidebarSection[] = [
  {
    id: "main",
    title: "MAIN MENU",
    items: [
      { id: "dashboard", label: "Dashboard", href: ADMIN_URLS.DASHBOARD },
      { id: "orders", label: "Order Management", href: ADMIN_URLS.ORDERS },
      { id: "customers", label: "Customers", href: ADMIN_URLS.CUSTOMERS },
      {
        id: "transactions",
        label: "Transaction",
        href: ADMIN_URLS.TRANSACTIONS,
      },
    ],
  },
  {
    id: "products",
    title: "PRODUCTS",
    items: [
      { id: "product-new", label: "Add Products", href: ADMIN_URLS.PRODUCT_NEW },
      { id: "product-list", label: "Product List", href: ADMIN_URLS.PRODUCTS },
    ],
  },
  {
    id: "admin",
    title: "ADMIN",
    items: [
      { id: "admins", label: "Manage Admins", href: ADMIN_URLS.ADMINS },
      { id: "settings", label: "Settings", href: ADMIN_URLS.SETTINGS },
    ],
  },
];

const resolveActiveId = (pathname: string): string | undefined => {
  if (pathname.startsWith(ADMIN_URLS.ORDERS)) return "orders";
  if (pathname.startsWith(ADMIN_URLS.CUSTOMERS)) return "customers";
  if (pathname.startsWith(ADMIN_URLS.TRANSACTIONS)) return "transactions";
  if (pathname.startsWith(ADMIN_URLS.PRODUCT_NEW)) return "product-new";
  if (pathname.startsWith(ADMIN_URLS.PRODUCTS)) return "product-list";
  if (pathname.startsWith(ADMIN_URLS.ADMINS)) return "admins";
  if (pathname.startsWith(ADMIN_URLS.SETTINGS)) return "settings";
  if (pathname.startsWith(ADMIN_URLS.DASHBOARD)) return "dashboard";
  return undefined;
};

const AdminAppLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  const pathname = usePathname();
  const activeId = resolveActiveId(pathname);

  return (
    <AdminLayout
      sidebar={
        <AdminSidebar sections={adminSections} activeId={activeId} />
      }
    >
      {children}
    </AdminLayout>
  );
};

export default AdminAppLayout;
