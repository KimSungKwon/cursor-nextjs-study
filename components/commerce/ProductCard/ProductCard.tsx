"use client";

import type { HTMLAttributes, KeyboardEvent, MouseEvent } from "react";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { RatingStars } from "@/components/commerce/RatingStars/RatingStars";
import {
  formatCommercePrice,
  type Product,
} from "@/components/commerce/types";

export interface ProductCardProps
  extends Omit<HTMLAttributes<HTMLElement>, "onClick"> {
  product: Product;
  isNew?: boolean;
  discountPercent?: number;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  onClick?: (productId: string) => void;
}

const HeartIcon = ({ filled }: { filled?: boolean }) => {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 20.5s-7.5-4.35-9.5-9.2C1.2 7.9 3.1 5 6.2 5c1.8 0 3.3 1 3.9 2.4C10.7 6 12.2 5 14 5c3.1 0 5 2.9 3.7 6.3C19.5 16.15 12 20.5 12 20.5z"
        fill={filled ? commerceColors.semantic.error : "none"}
        stroke={
          filled
            ? commerceColors.semantic.error
            : commerceColors.text.secondary
        }
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const ProductCard = ({
  product,
  isNew,
  discountPercent,
  onAddToCart,
  onToggleWishlist,
  onClick,
  className,
  style,
  ...props
}: ProductCardProps) => {
  const showNew = isNew ?? product.isNew;
  const salePercent =
    discountPercent ??
    product.discountPercent ??
    (product.salePrice != null && product.price > 0
      ? Math.round((1 - product.salePrice / product.price) * 100)
      : undefined);
  const displayPrice = product.salePrice ?? product.price;
  const showOriginal =
    product.salePrice != null && product.salePrice < product.price;

  const handleActivate = () => onClick?.(product.id);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick(product.id);
    }
  };

  const stop = (event: MouseEvent) => event.stopPropagation();

  return (
    <article
      className={cn(
        "group relative flex w-[262px] flex-col",
        onClick && "cursor-pointer",
        className,
      )}
      style={{
        backgroundColor: commerceColors.background.default,
        fontFamily: commerceTypography.fontFamily.body,
        ...style,
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <div
        className="relative h-[349px] w-full overflow-hidden"
        style={{ backgroundColor: commerceColors.background.light }}
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full" aria-hidden />
        )}

        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {showNew ? <Badge variant="new">NEW</Badge> : null}
          {salePercent != null && salePercent > 0 ? (
            <Badge variant="sale">-{salePercent}%</Badge>
          ) : null}
        </div>

        {onToggleWishlist ? (
          <IconButton
            variant="circle"
            size="md"
            aria-label={
              product.isLiked ? "위시리스트에서 제거" : "위시리스트에 추가"
            }
            aria-pressed={product.isLiked}
            className="absolute right-4 top-4"
            onClick={(event) => {
              stop(event);
              onToggleWishlist(product.id);
            }}
          >
            <HeartIcon filled={product.isLiked} />
          </IconButton>
        ) : null}

        {onAddToCart ? (
          <div
            className={cn(
              "absolute inset-x-4 bottom-4 opacity-0 transition-opacity",
              "group-hover:opacity-100 group-focus-within:opacity-100",
            )}
          >
            <Button
              variant="solid"
              size="md"
              className="h-[46px] w-full rounded-lg"
              onClick={(event) => {
                stop(event);
                onAddToCart(product.id);
              }}
            >
              Add to cart
            </Button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-1 pt-3">
        {product.rating != null ? (
          <RatingStars value={product.rating} readOnly />
        ) : null}
        <h3
          className="truncate"
          style={{
            color: commerceColors.text.secondary,
            fontSize: commerceTypography.body.md.semibold.fontSize,
            fontWeight: commerceTypography.fontWeight.semibold,
            lineHeight: "26px",
          }}
        >
          {product.name}
        </h3>
        <div className="flex items-center gap-3">
          <span
            style={{
              color: commerceColors.text.secondary,
              fontSize: commerceTypography.caption.md.semibold.fontSize,
              fontWeight: commerceTypography.fontWeight.semibold,
              lineHeight: "22px",
            }}
          >
            {formatCommercePrice(displayPrice)}
          </span>
          {showOriginal ? (
            <span
              className="line-through"
              style={{
                color: commerceColors.text.tertiary,
                fontSize: commerceTypography.caption.md.regular.fontSize,
                fontWeight: commerceTypography.fontWeight.regular,
                lineHeight: "22px",
              }}
            >
              {formatCommercePrice(product.price)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
};
