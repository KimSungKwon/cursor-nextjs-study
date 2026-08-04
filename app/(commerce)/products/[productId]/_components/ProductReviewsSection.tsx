"use client";

import Link from "next/link";
import type { HTMLAttributes } from "react";
import { AUTH_URLS } from "@/commons/constants/url";
import { useAuth } from "@/commons/hooks/useAuth";
import { cn } from "@/commons/utils/cn";
import { ReviewForm } from "@/components/commerce/ReviewForm";
import { Button } from "@/components/ui/Button";
import { CustomerReviewsHeader } from "./CustomerReviewsHeader";
import { ReviewList } from "./ReviewList";
import { ReviewSummaryDisplay } from "./ReviewSummaryDisplay";

export interface ProductReviewsSectionProps
  extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  productId: string;
  currentUserId?: string;
  isSuperAdmin?: boolean;
}

export const ProductReviewsSection = ({
  productId,
  isSuperAdmin: isSuperAdminProp,
  className,
  ...props
}: ProductReviewsSectionProps) => {
  const { isAuthenticated, isLoading, isSuperAdmin } = useAuth();
  const resolvedIsSuperAdmin = isSuperAdminProp ?? isSuperAdmin;

  return (
    <section
      className={cn("flex w-full max-w-[1120px] flex-col gap-10", className)}
      data-super-admin={resolvedIsSuperAdmin ? "true" : undefined}
      aria-label="상품 리뷰"
      {...props}
    >
      <ReviewSummaryDisplay />
      <CustomerReviewsHeader productId={productId} />

      {isLoading ? null : isAuthenticated ? (
        <ReviewForm productId={productId} />
      ) : (
        <div
          className={cn(
            "flex w-full flex-col items-start gap-4 rounded-2xl border border-[var(--commerce-border-light)]",
            "bg-[var(--commerce-background-paper)] p-6 sm:flex-row sm:items-center sm:justify-between",
          )}
        >
          <p
            className="text-[var(--commerce-text-tertiary)]"
            style={{
              fontFamily: "var(--commerce-body-md-regular-font-family)",
              fontSize: "var(--commerce-body-md-regular-font-size)",
              lineHeight: "26px",
            }}
          >
            리뷰를 작성하려면 로그인해 주세요.
          </p>
          <Link href={AUTH_URLS.LOGIN}>
            <Button type="button" variant="solid" size="sm" className="shrink-0">
              로그인
            </Button>
          </Link>
        </div>
      )}

      <ReviewList productId={productId} />
    </section>
  );
};
