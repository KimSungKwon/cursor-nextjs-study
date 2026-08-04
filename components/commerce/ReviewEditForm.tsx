"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  isAuthRequiredError,
  isForbiddenError,
  isNotFoundError,
} from "@/app/(commerce)/likes/errors";
import { updateReview } from "@/app/(commerce)/products/[productId]/review-actions";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { AUTH_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";
import { toast } from "@/commons/utils/toast";
import { RatingStars } from "@/components/commerce/RatingStars/RatingStars";
import { Button } from "@/components/ui/Button";

export type ReviewEditFormProps = {
  reviewId: string;
  productId: string;
  initialRating: number;
  initialContent: string;
  onCancel: () => void;
  onSuccess?: () => void;
  className?: string;
};

const MIN_LEN = 10;

export const ReviewEditForm = ({
  reviewId,
  productId,
  initialRating,
  initialContent,
  onCancel,
  onSuccess,
  className,
}: ReviewEditFormProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(initialRating);
  const [content, setContent] = useState(initialContent);
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
      await updateReview({
        reviewId,
        productId,
        rating,
        content: trimmed,
      });
      toast.success("리뷰가 수정되었습니다.");
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products.all,
      });
      router.refresh();
      onSuccess?.();
    } catch (error) {
      if (isAuthRequiredError(error)) {
        toast.error("로그인이 필요합니다.");
        router.push(AUTH_URLS.LOGIN);
        return;
      }
      if (isForbiddenError(error)) {
        toast.error("본인의 리뷰만 수정할 수 있습니다.");
        return;
      }
      if (isNotFoundError(error)) {
        toast.error("리뷰를 찾을 수 없습니다.");
        return;
      }
      toast.error(
        error instanceof Error ? error.message : "리뷰 수정에 실패했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <form
        className="flex w-full flex-col gap-3"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        noValidate
      >
        <RatingStars
          value={rating}
          readOnly={false}
          size={16}
          onChange={setRating}
          className="shrink-0"
        />

        <label className="sr-only" htmlFor={`review-edit-${reviewId}`}>
          리뷰 수정
        </label>
        <textarea
          id={`review-edit-${reviewId}`}
          value={content}
          rows={3}
          disabled={isSubmitting}
          minLength={MIN_LEN}
          aria-invalid={showInsufficientHint}
          aria-describedby={`review-edit-hint-${reviewId}`}
          className={cn(
            "min-h-[78px] w-full resize-y rounded-lg border bg-transparent px-3 py-2 outline-none",
            "border-[var(--commerce-border-light)]",
            "text-[var(--commerce-text-secondary)]",
            "placeholder:text-[var(--commerce-text-disabled)]",
            "focus-visible:outline-2 focus-visible:outline-offset-2",
            "focus-visible:outline-[var(--commerce-primary-main)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          style={{
            fontFamily: "var(--commerce-body-md-regular-font-family)",
            fontSize: "var(--commerce-body-md-regular-font-size)",
            lineHeight: "26px",
          }}
          onChange={(event) => setContent(event.target.value)}
        />

        <p
          id={`review-edit-hint-${reviewId}`}
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

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="solid"
            size="sm"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            저장
          </Button>
        </div>
      </form>
    </div>
  );
};
