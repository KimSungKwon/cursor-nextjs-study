"use client";

import { useState, type HTMLAttributes } from "react";
import type { ProductDetail } from "@/commons/types/product";
import { cn } from "@/commons/utils/cn";
import { LikeButton } from "@/components/commerce/LikeButton/LikeButton";
import { QuantitySelector } from "@/components/commerce/QuantitySelector/QuantitySelector";
import { AddToCartButton } from "@/components/commerce/product/AddToCartButton";

export interface AddToCartSectionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  product: ProductDetail;
  initialIsLiked?: boolean;
}

export const AddToCartSection = ({
  product,
  initialIsLiked = false,
  className,
  ...props
}: AddToCartSectionProps) => {
  const [quantity, setQuantity] = useState(1);

  const isSoldOut = product.status === "sold_out";

  return (
    <div
      className={cn("flex w-full max-w-[508px] flex-col gap-4", className)}
      {...props}
    >
      <div className="flex w-full items-center gap-6">
        <QuantitySelector
          value={quantity}
          min={1}
          size="md"
          disabled={isSoldOut}
          onChange={setQuantity}
        />
        <LikeButton
          productId={product.id}
          initialIsLiked={initialIsLiked}
          variant="labeled"
        />
      </div>

      <AddToCartButton
        product={product}
        quantity={quantity}
        soldOut={isSoldOut}
      />
    </div>
  );
};
