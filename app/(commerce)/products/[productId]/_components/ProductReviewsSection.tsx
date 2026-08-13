"use client";

import Link from "next/link";
import { useState, type HTMLAttributes } from "react";
import { AUTH_URLS } from "@/commons/constants/url";
import { useAuth } from "@/commons/hooks/useAuth";
import { cn } from "@/commons/utils/cn";
import { ReviewForm } from "@/components/commerce/ReviewForm";
import { RegenerateSummaryButton } from "@/components/commerce/product/RegenerateSummaryButton";
import { ReviewSummaryDisplay } from "@/components/commerce/product/ReviewSummaryDisplay";
import { Button } from "@/components/ui/Button";
import { CustomerReviewsHeader } from "./CustomerReviewsHeader";
import { ReviewList } from "./ReviewList";

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
  const { isAuthenticated, isLoading, isAdmin, isSuperAdmin } = useAuth();
  const resolvedIsSuperAdmin = isSuperAdminProp ?? isSuperAdmin;
  const resolvedIsAdmin = isSuperAdminProp ?? isAdmin;
  const [summaryRefreshToken, setSummaryRefreshToken] = useState(0);

  return (
    <section
      className={cn("flex w-full max-w-[1120px] flex-col gap-10", className)}
      data-super-admin={resolvedIsSuperAdmin ? "true" : undefined}
      aria-label="상품 리뷰"
      {...props}
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <RegenerateSummaryButton
            productId={productId}
            isAdmin={resolvedIsAdmin}
            onGenerated={() => {
              setSummaryRefreshToken((token) => token + 1);
            }}
          />
        </div>
        <ReviewSummaryDisplay
          productId={productId}
          refreshToken={summaryRefreshToken}
        />
      </div>
      <CustomerReviewsHeader productId={productId} />

      {isLoading ? null : isAuthenticated ? (
        <ReviewForm
          productId={productId}
          onSuccess={() => {
            setSummaryRefreshToken((token) => token + 1);
          }}
        />
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
