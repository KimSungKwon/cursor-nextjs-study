"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineCube, HiOutlineHome, HiOutlineShoppingCart } from "react-icons/hi2";
import { ADMIN_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";

const MENU_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: ADMIN_URLS.DASHBOARD,
    icon: HiOutlineHome,
  },
  {
    id: "orders",
    label: "Order Management",
    href: ADMIN_URLS.ORDERS,
    icon: HiOutlineShoppingCart,
  },
  {
    id: "products",
    label: "Product List",
    href: ADMIN_URLS.PRODUCTS,
    icon: HiOutlineCube,
  },
] as const;

function isActivePath(pathname: string, href: string): boolean {
  if (href === ADMIN_URLS.DASHBOARD) {
    return pathname === ADMIN_URLS.DASHBOARD;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Admin 좌측 메뉴
 */
export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside
      aria-label="관리자 메뉴"
      className="flex w-[260px] shrink-0 flex-col border-r"
      style={{
        backgroundColor: "var(--admin-background-default)",
        borderColor: "var(--admin-border-default)",
      }}
    >
      {/* <div className="flex h-16 items-center px-[18px]">
        <p
          className="truncate"
          style={{
            fontFamily: "var(--admin-font-family-heading)",
            fontSize: "20px",
            fontWeight: 500,
            lineHeight: "24px",
            color: "var(--admin-text-primary)",
          }}
        >
          Cursor Commerce
        </p>
      </div> */}

      <nav className="flex flex-1 flex-col gap-2 px-3.5 pb-6 mt-3">
        <p
          className="px-4 py-2 text-[11px] leading-[14px]"
          style={{
            fontFamily: "var(--admin-font-family-body)",
            color: "var(--admin-text-muted)",
          }}
        >
          MAIN MENU
        </p>
        <ul className="flex flex-col gap-2">
          {MENU_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-md px-4 transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-2",
                  )}
                  style={{
                    backgroundColor: active
                      ? "var(--admin-background-light)"
                      : "transparent",
                    color: active
                      ? "var(--admin-text-primary)"
                      : "var(--admin-text-muted)",
                    fontFamily: "var(--admin-font-family-body)",
                    fontSize: "15px",
                    fontWeight: active ? 600 : 400,
                    lineHeight: "22px",
                    outlineColor: "var(--admin-primary-main)",
                  }}
                >
                  <Icon size={22} aria-hidden />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
