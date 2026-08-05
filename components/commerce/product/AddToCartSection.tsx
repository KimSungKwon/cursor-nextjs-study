"use client";

import { useState, type HTMLAttributes } from "react";
import { useCartStore } from "@/commons/store/cart-store";
import type { ProductDetail } from "@/commons/types/product";
import { cn } from "@/commons/utils/cn";
import { toast } from "@/commons/utils/toast";
import { LikeButton } from "@/components/commerce/LikeButton/LikeButton";
import { QuantitySelector } from "@/components/commerce/QuantitySelector/QuantitySelector";
import { Button } from "@/components/ui/Button";

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
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const isSoldOut = product.status === "sold_out";

  const handleAddToCart = () => {
    if (isAdding || isSoldOut) return;

    setIsAdding(true);
    toast.success("장바구니에 담았습니다.");

    void addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.image_url,
        salePrice: product.salePrice ?? null,
        status: product.status,
      },
      quantity,
    )
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "장바구니 추가에 실패했습니다.",
        );
      })
      .finally(() => {
        setIsAdding(false);
      });
  };

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
          disabled={isSoldOut || isAdding}
          onChange={setQuantity}
        />
        <LikeButton
          productId={product.id}
          initialIsLiked={initialIsLiked}
          variant="labeled"
        />
      </div>

      <Button
        type="button"
        variant="solid"
        size="lg"
        className="w-full"
        loading={isAdding}
        disabled={isSoldOut || isAdding}
        onClick={handleAddToCart}
      >
        {isSoldOut ? "Sold Out" : "Add to Cart"}
      </Button>
    </div>
  );
};
