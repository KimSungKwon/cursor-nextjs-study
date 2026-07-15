import Link from "next/link";
import type { HTMLAttributes } from "react";
import { ACCOUNT_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";

export type FooterLink = {
  label: string;
  href: string;
};

export interface LayoutFooterProps extends HTMLAttributes<HTMLElement> {
  navLinks?: FooterLink[];
  legalLinks?: FooterLink[];
  copyright?: string;
}

const DEFAULT_NAV_LINKS: FooterLink[] = [
  { label: "Home", href: COMMERCE_URLS.HOME },
  { label: "Mypage", href: ACCOUNT_URLS.ACCOUNT },
  { label: "Contact Us", href: COMMERCE_URLS.CONTACT },
];

const DEFAULT_LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy Policy", href: COMMERCE_URLS.PRIVACY },
  { label: "Terms of Use", href: COMMERCE_URLS.TERMS },
];

export const LayoutFooter = ({
  navLinks = DEFAULT_NAV_LINKS,
  legalLinks = DEFAULT_LEGAL_LINKS,
  copyright = "Copyright © 2026 Cursor Commerce. All rights reserved",
  className,
  ...props
}: LayoutFooterProps) => {
  return (
    <footer
      className={cn(
        "mt-auto w-full bg-[var(--commerce-neutral-n07)]",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex h-[245px] w-full max-w-[1440px] flex-col px-4 sm:px-6 lg:px-10 xl:px-[160px]">
        {/* footer content — Figma: 상단 80px, 링크 행 h22 */}
        <div className="flex justify-center pt-20">
          <nav aria-label="푸터 메뉴">
            <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-2">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm leading-[22px] text-[var(--commerce-text-inverse)] transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--commerce-text-inverse)]"
                    style={{
                      fontFamily: "var(--commerce-font-family-body)",
                      fontWeight: 400,
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* bottom bar — Figma: 상단 보더 + copyright·법적 링크 한 줄 */}
        <div className="mt-auto">
          <div
            className="flex min-h-[52px] items-center justify-center border-t"
            style={{ borderColor: "var(--commerce-border-dark)" }}
          >
            <div className="flex flex-col items-center gap-3 py-4 sm:flex-row sm:gap-7">
              <p
                className="text-center text-xs leading-5 text-[var(--commerce-background-subtle)]"
                style={{
                  fontFamily: "var(--commerce-font-family-heading)",
                  fontWeight: 400,
                }}
              >
                {copyright}
              </p>

              <nav aria-label="법적 고지">
                <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
                  {legalLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-xs leading-5 text-[var(--commerce-text-inverse)] transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--commerce-text-inverse)]"
                        style={{
                          fontFamily: "var(--commerce-font-family-heading)",
                          fontWeight: 600,
                        }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
