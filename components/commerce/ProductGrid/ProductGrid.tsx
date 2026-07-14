"use client";

import type { HTMLAttributes } from "react";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";
import { ProductCard } from "@/components/commerce/ProductCard/ProductCard";
import type { Product } from "@/components/commerce/types";

export interface ProductGridProps extends HTMLAttributes<HTMLElement> {
  products: Product[];
  columns?: 2 | 3 | 4;
  gap?: number;
  isLoading?: boolean;
  emptyMessage?: string;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  onProductClick?: (productId: string) => void;
}

const columnClass: Record<2 | 3 | 4, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

const ProductCardSkeleton = () => {
  return (
    <div className="flex w-[262px] flex-col gap-3" aria-hidden>
      <div
        className="h-[349px] w-full animate-pulse rounded"
        style={{ backgroundColor: commerceColors.background.light }}
      />
      <div
        className="h-4 w-24 animate-pulse rounded"
        style={{ backgroundColor: commerceColors.background.subtle }}
      />
      <div
        className="h-5 w-40 animate-pulse rounded"
        style={{ backgroundColor: commerceColors.background.subtle }}
      />
      <div
        className="h-4 w-28 animate-pulse rounded"
        style={{ backgroundColor: commerceColors.background.subtle }}
      />
    </div>
  );
};

export const ProductGrid = ({
  products,
  columns = 4,
  gap = 24,
  isLoading = false,
  emptyMessage = "상품이 없습니다.",
  onAddToCart,
  onToggleWishlist,
  onProductClick,
  className,
  style,
  ...props
}: ProductGridProps) => {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="상품 목록 로딩 중"
        aria-busy
        className={cn("grid justify-items-center", columnClass[columns], className)}
        style={{ gap, ...style }}
        {...props}
      >
        {Array.from({ length: columns * 2 }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div
        role="status"
        className={cn("py-16 text-center", className)}
        style={{
          fontFamily: commerceTypography.fontFamily.body,
          color: commerceColors.text.tertiary,
          ...style,
        }}
        {...props}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={cn("grid justify-items-center", columnClass[columns], className)}
      style={{ gap, ...style }}
      {...props}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          onClick={onProductClick}
        />
      ))}
    </div>
  );
};
