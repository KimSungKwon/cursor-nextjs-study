"use client";

import type { HTMLAttributes } from "react";
import { useAuth } from "@/commons/hooks/useAuth";
import { cn } from "@/commons/utils/cn";
import { ReviewCard } from "@/components/commerce/ReviewCard/ReviewCard";
import { Button } from "@/components/ui/Button";
import { useProductReviews } from "@/features/products/api/useProductReviews";

export interface ReviewListProps extends HTMLAttributes<HTMLElement> {
  productId: string;
}

export const ReviewList = ({
  productId,
  className,
  ...props
}: ReviewListProps) => {
  const { currentUserId } = useAuth();
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useProductReviews(productId);

  const reviews = data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return (
      <p
        className="py-8 text-[var(--commerce-text-tertiary)]"
        style={{
          fontFamily: "var(--commerce-body-md-regular-font-family)",
          fontSize: "var(--commerce-body-md-regular-font-size)",
        }}
      >
        리뷰를 불러오는 중...
      </p>
    );
  }

  if (isError) {
    return (
      <p
        role="alert"
        className="py-8 text-[var(--commerce-semantic-error)]"
        style={{
          fontFamily: "var(--commerce-body-md-regular-font-family)",
          fontSize: "var(--commerce-body-md-regular-font-size)",
        }}
      >
        {error instanceof Error
          ? error.message
          : "리뷰를 불러오지 못했습니다."}
      </p>
    );
  }

  if (reviews.length === 0) {
    return (
      <p
        className="py-8 text-[var(--commerce-text-tertiary)]"
        style={{
          fontFamily: "var(--commerce-body-md-regular-font-family)",
          fontSize: "var(--commerce-body-md-regular-font-size)",
          lineHeight: "26px",
        }}
      >
        아직 등록된 리뷰가 없습니다.
      </p>
    );
  }

  return (
    <section className={cn("flex w-full flex-col gap-6", className)} {...props}>
      <div className="flex items-center justify-between gap-4">
        <h3
          className="text-[var(--commerce-text-primary)]"
          style={{
            fontFamily: "var(--commerce-headline-h6-font-family)",
            fontSize: "var(--commerce-headline-h6-font-size)",
            fontWeight: "var(--commerce-headline-h6-font-weight)",
            lineHeight: "34px",
            letterSpacing: "-0.6px",
          }}
        >
          {reviews.length} Reviews
        </h3>
      </div>

      <div className="flex flex-col gap-6">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            reviewId={review.id}
            productId={productId}
            authorUserId={review.userId}
            currentUserId={currentUserId}
            authorName={review.authorName}
            avatarUrl={review.avatarUrl}
            rating={review.rating}
            body={review.content}
          />
        ))}
      </div>

      {hasNextPage ? (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            loading={isFetchingNextPage}
            onClick={() => {
              void fetchNextPage();
            }}
          >
            Load more
          </Button>
        </div>
      ) : null}
    </section>
  );
};
