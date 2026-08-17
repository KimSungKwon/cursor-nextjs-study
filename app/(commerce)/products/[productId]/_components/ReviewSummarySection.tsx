import { getReviewSummary } from "@/app/(commerce)/products/[productId]/review-summary-actions";
import { RegenerateSummaryButton } from "@/components/commerce/product/RegenerateSummaryButton";
import { ReviewSummaryDisplay } from "@/components/commerce/product/ReviewSummaryDisplay";
import { checkAdminAccess } from "@/lib/auth/admin";

export type ReviewSummarySectionProps = {
  productId: string;
  isAdmin?: boolean;
};

/**
 * AI 리뷰 요약 조회 Server Component
 */
export const ReviewSummarySection = async ({
  productId,
  isAdmin,
}: ReviewSummarySectionProps) => {
  const [summary, resolvedIsAdmin] = await Promise.all([
    getReviewSummary(productId),
    isAdmin === undefined ? checkAdminAccess() : Promise.resolve(isAdmin),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <RegenerateSummaryButton productId={productId} isAdmin={resolvedIsAdmin} />
      </div>
      <ReviewSummaryDisplay summary={summary} />
    </div>
  );
};
