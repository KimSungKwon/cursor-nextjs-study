"use client";

import { useState, useTransition } from "react";
import { useCartStore } from "@/commons/store/cart-store";
import type { ProductDetail } from "@/commons/types/product";
import { toast } from "@/commons/utils/toast";
import { Button } from "@/components/ui/Button";

export type AddToCartButtonProps = {
  product: ProductDetail;
  quantity?: number;
  soldOut?: boolean;
};

/**
 * 장바구니 추가 버튼 — Optimistic UI
 */
export const AddToCartButton = ({
  product,
  quantity = 1,
  soldOut = false,
}: AddToCartButtonProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdded, setIsAdded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (isPending || soldOut) return;

    const previousAdded = isAdded;
    setIsAdded(true);

    startTransition(async () => {
      try {
        await addItem(
          {
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.image_url,
            salePrice: product.salePrice ?? null,
            status: product.status,
          },
          quantity,
        );
      } catch (error) {
        setIsAdded(previousAdded);
        toast.error(
          error instanceof Error
            ? error.message
            : "장바구니 추가에 실패했습니다.",
        );
      }
    });
  };

  const label = soldOut
    ? "Sold Out"
    : isPending
      ? "추가 중..."
      : isAdded
        ? "추가됨"
        : "Add to Cart";

  return (
    <Button
      type="button"
      variant="solid"
      size="lg"
      className="w-full"
      loading={isPending}
      disabled={soldOut || isPending}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
};
