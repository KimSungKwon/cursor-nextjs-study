"use client";

import type { HTMLAttributes, KeyboardEvent, MouseEvent } from "react";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";
import { LikeButton } from "@/components/commerce/LikeButton/LikeButton";
import { RatingStars } from "@/components/commerce/RatingStars/RatingStars";
import {
  formatCommercePrice,
  type Product,
} from "@/components/commerce/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface ProductCardProps
  extends Omit<HTMLAttributes<HTMLElement>, "onClick"> {
  product: Product;
  isNew?: boolean;
  discountPercent?: number;
  onAddToCart?: (productId: string) => void;
  showWishlist?: boolean;
  onClick?: (productId: string) => void;
}

export const ProductCard = ({
  product,
  isNew,
  discountPercent,
  onAddToCart,
  showWishlist = true,
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

        {showWishlist ? (
          <LikeButton
            productId={product.id}
            initialIsLiked={product.isLiked}
            variant="icon"
            className="absolute right-4 top-4"
          />
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
