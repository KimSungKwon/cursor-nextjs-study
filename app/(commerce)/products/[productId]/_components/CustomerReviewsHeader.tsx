"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/commons/utils/cn";
import { RatingStars } from "@/components/commerce/RatingStars/RatingStars";
import { useProductRating } from "@/features/products/api/useProductRating";

export interface CustomerReviewsHeaderProps
  extends HTMLAttributes<HTMLElement> {
  productId: string;
}

export const CustomerReviewsHeader = ({
  productId,
  className,
  ...props
}: CustomerReviewsHeaderProps) => {
  const { data } = useProductRating(productId);
  const rating = data?.rating ?? 0;
  const reviewCount = data?.reviewCount ?? 0;

  return (
    <header className={cn("flex flex-col gap-4", className)} {...props}>
      <h2
        className="text-[var(--commerce-text-secondary)]"
        style={{
          fontFamily: "var(--commerce-headline-h6-font-family)",
          fontSize: "var(--commerce-headline-h6-font-size)",
          fontWeight: "var(--commerce-headline-h6-font-weight)",
          lineHeight: "34px",
          letterSpacing: "-0.6px",
        }}
      >
        Customer Reviews
      </h2>

      <div className="flex items-center gap-2">
        <RatingStars value={rating} readOnly size={16} />
        {reviewCount > 0 ? (
          <span
            className="text-[var(--commerce-text-secondary)]"
            style={{
              fontFamily: "var(--commerce-caption-sm-regular-font-family)",
              fontSize: "var(--commerce-caption-sm-regular-font-size)",
              fontWeight: "var(--commerce-caption-sm-regular-font-weight)",
              lineHeight: "20px",
            }}
          >
            {reviewCount} Reviews
          </span>
        ) : null}
      </div>
    </header>
  );
};
