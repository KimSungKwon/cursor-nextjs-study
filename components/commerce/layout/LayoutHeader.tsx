"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type HTMLAttributes } from "react";
import { ACCOUNT_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import { useCartStore } from "@/commons/store/cart-store";
import { cn } from "@/commons/utils/cn";
import { IconButton } from "@/components/ui/IconButton";

export interface LayoutHeaderProps extends HTMLAttributes<HTMLElement> {
  logoText?: string;
  cartCount?: number;
  onSearchClick?: () => void;
}

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M16.5 16.5L20 20"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="9" r="3.25" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M5.5 19.5c1.6-3.1 3.9-4.5 6.5-4.5s4.9 1.4 6.5 4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M7 8.5h10l-.8 9.2a1.5 1.5 0 0 1-1.5 1.3H9.3a1.5 1.5 0 0 1-1.5-1.3L7 8.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M9 8.5V7a3 3 0 0 1 6 0v1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M4 7h16M4 12h16M4 17h16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M6 6l12 12M18 6L6 18"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const LayoutHeader = ({
  logoText = "Cursor Commerce",
  cartCount,
  onSearchClick,
  className,
  ...props
}: LayoutHeaderProps) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const storeCartCount = useCartStore((state) => state.totalQuantity);
  const resolvedCartCount = cartCount ?? storeCartCount;
  const badgeLabel =
    resolvedCartCount > 99 ? "99+" : String(Math.max(0, resolvedCartCount));

  const handleSearchClick = () => {
    if (onSearchClick) {
      onSearchClick();
      return;
    }
    router.push(COMMERCE_URLS.SHOP);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-[var(--commerce-border-light)] bg-[var(--commerce-background-default)]",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex h-[60px] w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-40">
        <Link
          href={COMMERCE_URLS.HOME}
          className="shrink-0 font-medium tracking-tight text-[var(--commerce-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--commerce-primary-main)]"
          style={{
            fontFamily: "var(--commerce-navigation-logo-font-family)",
            fontSize: "var(--commerce-navigation-logo-font-size)",
            lineHeight: "var(--commerce-navigation-logo-line-height)",
          }}
        >
          {logoText}
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <IconButton
            aria-label="검색"
            size="sm"
            className="hidden text-[var(--commerce-text-secondary)] sm:inline-flex"
            onClick={handleSearchClick}
          >
            <SearchIcon />
          </IconButton>

          <Link
            href={ACCOUNT_URLS.ACCOUNT}
            className="hidden size-6 items-center justify-center text-[var(--commerce-text-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--commerce-primary-main)] sm:inline-flex"
            aria-label="마이페이지"
          >
            <UserIcon />
          </Link>

          <Link
            href={COMMERCE_URLS.CART}
            className="relative hidden h-7 items-center gap-1.5 text-[var(--commerce-text-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--commerce-primary-main)] sm:inline-flex"
            aria-label={
              resolvedCartCount > 0
                ? `장바구니, ${resolvedCartCount}개`
                : "장바구니"
            }
          >
            <CartIcon />
            {resolvedCartCount > 0 ? (
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-[var(--commerce-primary-main)] font-[family-name:var(--commerce-font-family-body)] text-xs font-bold leading-5 text-[var(--commerce-text-inverse)]">
                {badgeLabel}
              </span>
            ) : null}
          </Link>

          <IconButton
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            size="sm"
            className="text-[var(--commerce-text-secondary)] sm:hidden"
            aria-expanded={menuOpen}
            aria-controls="commerce-mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="commerce-mobile-nav"
          className="border-t border-[var(--commerce-border-light)] bg-[var(--commerce-background-default)] px-4 py-4 sm:hidden"
          aria-label="모바일 메뉴"
        >
          <ul className="flex flex-col gap-3">
            <li>
              <button
                type="button"
                className="flex w-full items-center gap-3 text-left font-[family-name:var(--commerce-font-family-body)] text-base text-[var(--commerce-text-secondary)]"
                onClick={() => {
                  setMenuOpen(false);
                  handleSearchClick();
                }}
              >
                <SearchIcon />
                검색
              </button>
            </li>
            <li>
              <Link
                href={ACCOUNT_URLS.ACCOUNT}
                className="flex items-center gap-3 font-[family-name:var(--commerce-font-family-body)] text-base text-[var(--commerce-text-secondary)]"
                onClick={() => setMenuOpen(false)}
              >
                <UserIcon />
                마이페이지
              </Link>
            </li>
            <li>
              <Link
                href={COMMERCE_URLS.CART}
                className="flex items-center gap-3 font-[family-name:var(--commerce-font-family-body)] text-base text-[var(--commerce-text-secondary)]"
                onClick={() => setMenuOpen(false)}
              >
                <CartIcon />
                장바구니
                {resolvedCartCount > 0 ? (
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-[var(--commerce-primary-main)] text-xs font-bold text-[var(--commerce-text-inverse)]">
                    {badgeLabel}
                  </span>
                ) : null}
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
};
