"use client";

import type { HTMLAttributes } from "react";
import type { ProductCategory, ProductDetail } from "@/commons/types/product";
import { cn } from "@/commons/utils/cn";
import { RatingStars } from "@/components/commerce/RatingStars/RatingStars";
import { formatCommercePrice } from "@/components/commerce/types";
import { useProductRating } from "@/features/products/api/useProductRating";

export interface ProductInfoSectionProps
  extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  product: ProductDetail;
}

const DEFAULT_MEASUREMENTS = '17 1/2x20 5/8 "';
const DEFAULT_CATEGORIES: ProductCategory[] = [
  { id: "living-room", name: "Living Room" },
  { id: "bedroom", name: "Bedroom" },
];

export const ProductInfoSection = ({
  product,
  className,
  ...props
}: ProductInfoSectionProps) => {
  const { data: ratingData } = useProductRating(product.id);
  const rating = ratingData?.rating ?? 0;
  const reviewCount = ratingData?.reviewCount ?? 0;
  const hasReviews = reviewCount > 0;

  const showSalePrice =
    product.salePrice != null && product.salePrice < product.price;
  const displayPrice = showSalePrice
    ? (product.salePrice as number)
    : product.price;

  const measurements =
    product.measurements?.trim() || DEFAULT_MEASUREMENTS;
  const categories =
    product.categories && product.categories.length > 0
      ? product.categories
      : DEFAULT_CATEGORIES;
  const categoryLabel = categories.map((category) => category.name).join(", ");

  return (
    <section
      className={cn("flex w-full flex-col gap-[24px]", className)}
      aria-labelledby={`product-title-${product.id}`}
      {...props}
    >
      <div className="flex flex-col gap-[8px] border-b border-[var(--commerce-border-light)] pb-6">
        <div className="flex items-center gap-[8px]">
          <RatingStars value={rating} readOnly size={16} />
          {hasReviews ? (
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

        <h1
          id={`product-title-${product.id}`}
          className="text-[var(--commerce-text-secondary)]"
          style={{
            fontFamily: "var(--commerce-headline-h4-font-family)",
            fontSize: "var(--commerce-headline-h4-font-size)",
            fontWeight: "var(--commerce-headline-h4-font-weight)",
            lineHeight: "44px",
            letterSpacing: "-0.4px",
          }}
        >
          {product.name}
        </h1>

        {product.description ? (
          <p
            className="whitespace-pre-wrap text-[var(--commerce-text-tertiary)]"
            style={{
              fontFamily: "var(--commerce-body-md-regular-font-family)",
              fontSize: "var(--commerce-body-md-regular-font-size)",
              fontWeight: "var(--commerce-body-md-regular-font-weight)",
              lineHeight: "26px",
            }}
          >
            {product.description}
          </p>
        ) : null}

        <div className="flex items-baseline gap-[12px] pt-[8px]">
          <span
            className="text-[var(--commerce-text-secondary)]"
            style={{
              fontFamily: "var(--commerce-headline-h6-font-family)",
              fontSize: "var(--commerce-headline-h6-font-size)",
              fontWeight: "var(--commerce-headline-h6-font-weight)",
              lineHeight: "34px",
              letterSpacing: "-0.6px",
            }}
          >
            {formatCommercePrice(displayPrice)}
          </span>
          {showSalePrice ? (
            <span
              className="line-through text-[var(--commerce-text-tertiary)]"
              style={{
                fontFamily: "var(--commerce-headline-h7-font-family)",
                fontSize: "var(--commerce-headline-h7-font-size)",
                fontWeight: "var(--commerce-headline-h7-font-weight)",
                lineHeight: "28px",
              }}
            >
              {formatCommercePrice(product.price)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-[8px]">
        <span
          className="text-[var(--commerce-text-tertiary)]"
          style={{
            fontFamily: "var(--commerce-caption-md-semibold-font-family)",
            fontSize: "var(--commerce-caption-md-semibold-font-size)",
            fontWeight: "var(--commerce-caption-md-semibold-font-weight)",
            lineHeight: "var(--commerce-caption-md-semibold-line-height)",
          }}
        >
          Measurements
        </span>
        <span
          className="text-[var(--commerce-text-primary)]"
          style={{
            fontFamily: "var(--commerce-caption-md-regular-font-family)",
            fontSize: "var(--commerce-caption-md-regular-font-size)",
            fontWeight: "var(--commerce-caption-md-regular-font-weight)",
            lineHeight: "var(--commerce-caption-md-regular-line-height)",
          }}
        >
          {measurements}
        </span>
      </div>

      <div className="flex items-center gap-[8px] border-t border-[var(--commerce-border-light)] pt-6">
        <span
          className="shrink-0 text-[var(--commerce-text-tertiary)]"
          style={{
            fontFamily: "var(--commerce-caption-sm-regular-font-family)",
            fontSize: "var(--commerce-caption-sm-regular-font-size)",
            fontWeight: "var(--commerce-caption-sm-regular-font-weight)",
            lineHeight: "var(--commerce-caption-sm-regular-line-height)",
          }}
        >
          CATEGORY
        </span>
        <span
          className="text-[var(--commerce-text-secondary)]"
          style={{
            fontFamily: "var(--commerce-caption-sm-regular-font-family)",
            fontSize: "var(--commerce-caption-sm-regular-font-size)",
            fontWeight: "var(--commerce-caption-sm-regular-font-weight)",
            lineHeight: "var(--commerce-caption-sm-regular-line-height)",
          }}
        >
          {categoryLabel}
        </span>
      </div>
    </section>
  );
};
