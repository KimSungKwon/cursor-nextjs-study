import { cn } from "@/commons/utils/cn";
import { RatingStars } from "@/components/commerce/RatingStars/RatingStars";
import { formatCommercePrice } from "@/components/commerce/types";
import type { ProductDetailData } from "@/features/products/api/useProductDetail";
import { Badge } from "@/components/ui/Badge";

export interface ProductDetailProps {
  product: ProductDetailData;
  className?: string;
}

/**
 * 상품 상세 임시 컴포넌트 (추후 Figma 기준으로 고도화)
 */
export function ProductDetail({ product, className }: ProductDetailProps) {
  const displayPrice = product.salePrice ?? product.price;
  const showOriginal =
    product.salePrice != null && product.salePrice < product.price;
  const discountPercent =
    product.salePrice != null && product.price > 0 && showOriginal
      ? Math.round((1 - product.salePrice / product.price) * 100)
      : undefined;

  return (
    <article
      className={cn(
        "grid w-full gap-8 lg:grid-cols-2 lg:gap-12",
        className,
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[var(--commerce-background-light)]">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center text-[var(--commerce-text-tertiary)]"
            style={{ fontFamily: "var(--commerce-font-family-body)" }}
          >
            No image
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2">
          {product.status === "sold_out" ? (
            <Badge variant="neutral">Sold out</Badge>
          ) : null}
          {discountPercent != null && discountPercent > 0 ? (
            <Badge variant="sale">-{discountPercent}%</Badge>
          ) : null}
        </div>

        <h1
          className="font-medium text-[var(--commerce-text-primary)]"
          style={{
            fontFamily: "var(--commerce-headline-h5-font-family)",
            fontSize:
              "clamp(1.5rem, 3vw, var(--commerce-headline-h5-font-size))",
            lineHeight: "var(--commerce-headline-h5-line-height)",
          }}
        >
          {product.name}
        </h1>

        {product.rating != null ? (
          <div className="flex items-center gap-2">
            <RatingStars value={product.rating} readOnly />
            <span
              className="text-[var(--commerce-text-tertiary)]"
              style={{
                fontFamily: "var(--commerce-body-md-regular-font-family)",
                fontSize: "var(--commerce-body-md-regular-font-size)",
              }}
            >
              {product.rating.toFixed(1)}
            </span>
          </div>
        ) : null}

        <div className="flex items-baseline gap-3">
          <span
            className="font-semibold text-[var(--commerce-text-primary)]"
            style={{
              fontFamily: "var(--commerce-body-lg-semibold-font-family)",
              fontSize: "var(--commerce-body-lg-semibold-font-size)",
            }}
          >
            {formatCommercePrice(displayPrice)}
          </span>
          {showOriginal ? (
            <span
              className="text-[var(--commerce-text-tertiary)] line-through"
              style={{
                fontFamily: "var(--commerce-body-md-regular-font-family)",
                fontSize: "var(--commerce-body-md-regular-font-size)",
              }}
            >
              {formatCommercePrice(product.price)}
            </span>
          ) : null}
        </div>

        {product.description ? (
          <p
            className="whitespace-pre-wrap text-[var(--commerce-text-secondary)]"
            style={{
              fontFamily: "var(--commerce-body-md-regular-font-family)",
              fontSize: "var(--commerce-body-md-regular-font-size)",
              lineHeight: "var(--commerce-body-md-regular-line-height)",
            }}
          >
            {product.description}
          </p>
        ) : null}
      </div>
    </article>
  );
}
