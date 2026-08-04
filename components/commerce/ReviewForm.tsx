"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { isAuthRequiredError } from "@/app/(commerce)/likes/errors";
import { createReview } from "@/app/(commerce)/products/[productId]/review-actions";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { AUTH_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";
import { toast } from "@/commons/utils/toast";
import { RatingStars } from "@/components/commerce/RatingStars/RatingStars";
import { Button } from "@/components/ui/Button";

export type ReviewFormProps = {
  productId: string;
  className?: string;
};

const MIN_LEN = 10;

export const ReviewForm = ({ productId, className }: ReviewFormProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmed = content.trim();
  const remaining = Math.max(0, MIN_LEN - trimmed.length);
  const meetsMinLength = remaining === 0;
  const showInsufficientHint = trimmed.length > 0 && !meetsMinLength;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (rating < 1 || rating > 5) {
      toast.error("별점을 선택해 주세요.");
      return;
    }

    if (!meetsMinLength) {
      toast.error(`리뷰 내용은 최소 ${MIN_LEN}자 이상이어야 합니다.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview({ productId, rating, content: trimmed });
      setContent("");
      setRating(5);
      toast.success("리뷰가 등록되었습니다.");
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products.all,
      });
      router.refresh();
    } catch (error) {
      if (isAuthRequiredError(error)) {
        toast.error("로그인이 필요합니다.");
        router.push(AUTH_URLS.LOGIN);
        return;
      }
      toast.error(
        error instanceof Error ? error.message : "리뷰 등록에 실패했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <form
        className={cn(
          "flex min-h-[72px] w-full flex-col items-stretch gap-3 rounded-2xl border px-6 py-4",
          "border-[var(--commerce-border-light)] bg-[var(--commerce-background-paper)]",
          "sm:h-[72px] sm:flex-row sm:items-center sm:gap-4 sm:py-0",
        )}
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        noValidate
      >
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <RatingStars
            value={rating}
            readOnly={false}
            size={16}
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
            disabled={isSubmitting}
            minLength={MIN_LEN}
            autoComplete="off"
            aria-invalid={showInsufficientHint}
            aria-describedby={`review-hint-${productId}`}
            className={cn(
              "min-w-0 flex-1 border-0 bg-transparent outline-none",
              "text-[var(--commerce-text-secondary)]",
              "placeholder:text-[var(--commerce-text-disabled)]",
              "focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
            style={{
              fontFamily: "var(--commerce-body-md-regular-font-family)",
              fontSize: "var(--commerce-body-md-regular-font-size)",
              lineHeight: "26px",
            }}
            onChange={(event) => setContent(event.target.value)}
          />
        </div>

        <Button
          type="submit"
          variant="pill"
          size="sm"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="h-10 w-full shrink-0 px-10 sm:w-[176px] sm:self-center"
        >
          Write Review
        </Button>
      </form>

      <p
        id={`review-hint-${productId}`}
        className={cn(
          "px-1",
          showInsufficientHint
            ? "text-[var(--commerce-semantic-error)]"
            : "text-[var(--commerce-text-tertiary)]",
        )}
        style={{
          fontFamily: "var(--commerce-font-family-body)",
          fontSize: "var(--commerce-caption-sm-regular-font-size)",
          lineHeight: "18px",
        }}
        aria-live="polite"
      >
        {meetsMinLength
          ? `${trimmed.length}자 (최소 ${MIN_LEN}자 충족)`
          : showInsufficientHint
            ? `${trimmed.length}/${MIN_LEN}자 · ${remaining}자 더 입력해 주세요`
            : `최소 ${MIN_LEN}자 이상 입력해 주세요`}
      </p>
    </div>
  );
};
