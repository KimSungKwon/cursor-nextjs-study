"use client";

import { useState, type FormEvent, type HTMLAttributes } from "react";
import { commerceColors } from "@/commons/constants/color";
import { cn } from "@/commons/utils/cn";
import { toast } from "@/commons/utils/toast";
import { RatingStars } from "@/components/commerce/RatingStars/RatingStars";
import { Button } from "@/components/ui/Button";

export interface ReviewFormProps
  extends Omit<HTMLAttributes<HTMLFormElement>, "onSubmit"> {
  productId: string;
  onSubmitReview?: (payload: {
    productId: string;
    rating: number;
    content: string;
  }) => void | Promise<void>;
}

export const ReviewForm = ({
  productId,
  onSubmitReview,
  className,
  ...props
}: ReviewFormProps) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = content.trim();
    if (!trimmed) {
      toast.error("리뷰 내용을 입력해 주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmitReview?.({
        productId,
        rating,
        content: trimmed,
      });
      setContent("");
      setRating(5);
      toast.success("리뷰가 등록되었습니다.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "리뷰 등록에 실패했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className={cn(
        "flex w-full flex-col gap-4 rounded-2xl border border-[var(--commerce-border-light)] bg-[var(--commerce-background-paper)] p-6 sm:flex-row sm:items-center",
        className,
      )}
      onSubmit={handleSubmit}
      {...props}
    >
      <RatingStars
        value={rating}
        readOnly={false}
        onChange={setRating}
        className="shrink-0"
      />

      <label className="sr-only" htmlFor={`review-content-${productId}`}>
        리뷰 내용
      </label>
      <input
        id={`review-content-${productId}`}
        type="text"
        value={content}
        placeholder="Share your thoughts"
        className={cn(
          "min-w-0 flex-1 bg-transparent outline-none",
          "placeholder:text-[var(--commerce-text-disabled)]",
          "text-[var(--commerce-text-secondary)]",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
        )}
        style={{
          fontFamily: "var(--commerce-body-md-regular-font-family)",
          fontSize: "var(--commerce-body-md-regular-font-size)",
          lineHeight: "26px",
          outlineColor: commerceColors.primary.main,
        }}
        disabled={isSubmitting}
        onChange={(event) => setContent(event.target.value)}
      />

      <Button
        type="submit"
        variant="pill"
        size="sm"
        loading={isSubmitting}
        className="shrink-0"
      >
        Write Review
      </Button>
    </form>
  );
};
