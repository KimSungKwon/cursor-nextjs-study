"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  useTransition,
  type ButtonHTMLAttributes,
} from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toggleLikeItem } from "@/app/(commerce)/likes/actions";
import { isAuthRequiredError } from "@/app/(commerce)/likes/errors";
import { commerceColors } from "@/commons/constants/color";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { AUTH_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";
import { toast } from "@/commons/utils/toast";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";

export type LikeButtonVariant = "icon" | "labeled";

export interface LikeButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children"> {
  productId: string;
  initialIsLiked?: boolean;
  variant?: LikeButtonVariant;
}

const HeartIcon = ({
  filled,
  size = 24,
}: {
  filled?: boolean;
  size?: number;
}) => {
  const color = filled
    ? commerceColors.semantic.error
    : commerceColors.text.secondary;

  if (filled) {
    return (
      <FaHeart
        size={size}
        color={color}
        aria-hidden
        className="block shrink-0"
      />
    );
  }

  return (
    <FaRegHeart
      size={size}
      color={color}
      aria-hidden
      className="block shrink-0"
    />
  );
};

/**
 * 상품 찜하기 버튼 (Optimistic UI)
 */
export const LikeButton = ({
  productId,
  initialIsLiked = false,
  variant = "labeled",
  className,
  disabled,
  ...props
}: LikeButtonProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked, productId]);

  const ariaLabel = isLiked ? "위시리스트에서 제거" : "위시리스트에 추가";

  const handleClick = () => {
    if (isPending) return;

    const previous = isLiked;
    const next = !previous;
    setIsLiked(next);

    startTransition(async () => {
      try {
        const result = await toggleLikeItem(productId);
        setIsLiked(result.isLiked);
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.products.all,
        });
        toast.success(
          result.isLiked
            ? "위시리스트에 추가했습니다."
            : "위시리스트에서 제거했습니다.",
        );
      } catch (error) {
        setIsLiked(previous);

        if (isAuthRequiredError(error)) {
          toast.error("로그인이 필요합니다.");
          router.push(AUTH_URLS.LOGIN);
          return;
        }

        toast.error(
          error instanceof Error
            ? error.message
            : "찜하기 처리에 실패했습니다.",
        );
      }
    });
  };

  if (variant === "icon") {
    return (
      <IconButton
        variant="circle"
        size="md"
        aria-label={ariaLabel}
        aria-pressed={isLiked}
        disabled={disabled || isPending}
        className={className}
        onClick={(event) => {
          event.stopPropagation();
          handleClick();
        }}
        {...props}
      >
        <HeartIcon filled={isLiked} size={20} />
      </IconButton>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={cn("h-[52px] min-w-0 flex-1", className)}
      leftIcon={<HeartIcon filled={isLiked} />}
      disabled={disabled || isPending}
      aria-pressed={isLiked}
      aria-label={ariaLabel}
      onClick={handleClick}
      {...props}
    >
      Wishlist
    </Button>
  );
};
