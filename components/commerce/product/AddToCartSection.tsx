"use client";

import { useEffect, useState, type HTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import { commerceColors } from "@/commons/constants/color";
import { AUTH_URLS } from "@/commons/constants/url";
import { AuthRequiredError } from "@/commons/errors/AuthRequiredError";
import { useCartStore } from "@/commons/store/cart-store";
import type { ProductDetail } from "@/commons/types/product";
import { cn } from "@/commons/utils/cn";
import { toast } from "@/commons/utils/toast";
import { QuantitySelector } from "@/components/commerce/QuantitySelector/QuantitySelector";
import { Button } from "@/components/ui/Button";

export interface AddToCartSectionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  product: ProductDetail;
  initialIsLiked?: boolean;
}

const HeartIcon = ({ filled }: { filled?: boolean }) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
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

export const AddToCartSection = ({
  product,
  initialIsLiked = false,
  className,
  ...props
}: AddToCartSectionProps) => {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(initialIsLiked);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsWishlisted(initialIsLiked);
  }, [initialIsLiked]);

  const isSoldOut = product.status === "sold_out";

  const handleWishlistClick = () => {
    if (isPending) return;

    setIsPending(true);
    setIsWishlisted((prev) => !prev);
    // 추후 찜하기 API 연동 예정 — 지금은 Optimistic UI만 적용
    setIsPending(false);
  };

  const handleAddToCart = () => {
    try {
      addItem(
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
      toast.success("장바구니에 담았습니다.");
    } catch (error) {
      if (error instanceof AuthRequiredError) {
        router.push(AUTH_URLS.LOGIN);
        return;
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "장바구니 추가에 실패했습니다.",
      );
    }
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
          disabled={isSoldOut}
          onChange={setQuantity}
        />
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-[52px] min-w-0 flex-1"
          leftIcon={<HeartIcon filled={isWishlisted} />}
          disabled={isPending}
          aria-pressed={isWishlisted}
          aria-label={isWishlisted ? "위시리스트에서 제거" : "위시리스트에 추가"}
          onClick={handleWishlistClick}
        >
          Wishlist
        </Button>
      </div>

      <Button
        type="button"
        variant="solid"
        size="lg"
        className="h-[52px] w-full"
        disabled={isSoldOut}
        onClick={handleAddToCart}
      >
        {isSoldOut ? "Sold Out" : "Add to Cart"}
      </Button>
    </div>
  );
};
