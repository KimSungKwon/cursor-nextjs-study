import { Suspense, type HTMLAttributes } from "react";
import { cn } from "@/commons/utils/cn";
import { ReviewListSkeleton } from "@/components/ui/ReviewListSkeleton";
import { ReviewSummarySkeleton } from "@/components/ui/ReviewSummarySkeleton";
import { CustomerReviewsHeader } from "./CustomerReviewsHeader";
import { ReviewComposer } from "./ReviewComposer";
import { ReviewListSection } from "./ReviewListSection";
import { ReviewSummarySection } from "./ReviewSummarySection";

export interface ProductReviewsSectionProps
  extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  productId: string;
  currentUserId?: string;
  isSuperAdmin?: boolean;
}

/**
 * 상품 리뷰 영역 — 요약/목록은 Suspense로 점진 로드
 */
export const ProductReviewsSection = ({
  productId,
  isSuperAdmin = false,
  className,
  ...props
}: ProductReviewsSectionProps) => {
  return (
    <section
      className={cn("flex w-full max-w-[1120px] flex-col gap-10", className)}
      data-super-admin={isSuperAdmin ? "true" : undefined}
      aria-label="상품 리뷰"
      {...props}
    >
      <Suspense fallback={<ReviewSummarySkeleton />}>
        <ReviewSummarySection productId={productId} />
      </Suspense>
      <CustomerReviewsHeader productId={productId} />
      <ReviewComposer productId={productId} />
      <Suspense fallback={<ReviewListSkeleton />}>
        <ReviewListSection productId={productId} />
      </Suspense>
    </section>
  );
};
