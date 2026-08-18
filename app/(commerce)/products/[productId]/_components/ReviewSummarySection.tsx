import {
  getReviewConfidenceStats,
  getReviewSummary,
} from "@/app/(commerce)/products/[productId]/review-summary-actions";
import { EnhancedReviewSummary } from "@/app/(commerce)/products/[productId]/_components/EnhancedReviewSummary";
import { checkAdminAccess } from "@/lib/auth/admin";

export type ReviewSummarySectionProps = {
  productId: string;
};

/**
 * AI 리뷰 요약 조회 Server Component
 */
export const ReviewSummarySection = async ({
  productId,
}: ReviewSummarySectionProps) => {
  const [summary, resolvedIsAdmin, stats] = await Promise.all([
    getReviewSummary(productId),
    checkAdminAccess(),
    getReviewConfidenceStats(productId),
  ]);

  return (
    <EnhancedReviewSummary
      productId={productId}
      isAdmin={resolvedIsAdmin}
      initialSummary={summary}
      stats={stats}
    />
  );
};
