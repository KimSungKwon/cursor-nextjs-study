"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  restoreAiReviewSummary,
  type ReviewConfidenceStats,
} from "@/app/(commerce)/products/[productId]/review-summary-actions";
import { RetryReviewSummaryButton } from "@/components/commerce/product/RetryReviewSummaryButton";
import { ReviewSummaryConfidence } from "@/components/commerce/product/ReviewSummaryConfidence";
import {
  diffText,
  ReviewSummaryDiff,
} from "@/components/commerce/product/ReviewSummaryDiff";
import { ReviewSummaryDisplay } from "@/components/commerce/product/ReviewSummaryDisplay";
import type { ReviewSummaryResult } from "@/lib/ai/review-summary";

export type EnhancedReviewSummaryProps = {
  productId: string;
  isAdmin: boolean;
  initialSummary: ReviewSummaryResult | null;
  stats: ReviewConfidenceStats;
};

function computeSummaryStability(
  previous: ReviewSummaryResult | null,
  current: ReviewSummaryResult | null,
): number {
  if (!previous || !current) {
    return 1;
  }
  const tokens = diffText(previous.summary, current.summary);
  const total = tokens.length;
  if (total === 0) {
    return 1;
  }
  const unchanged = tokens.filter((token) => token.type === "unchanged").length;
  return unchanged / total;
}

/**
 * 신뢰도 · Diff · 재시도가 포함된 AI 리뷰 요약 영역
 */
export const EnhancedReviewSummary = ({
  productId,
  isAdmin,
  initialSummary,
  stats,
}: EnhancedReviewSummaryProps) => {
  const router = useRouter();
  const [isRestoring, startRestore] = useTransition();
  const [summary, setSummary] = useState<ReviewSummaryResult | null>(
    initialSummary,
  );
  const [previousSummary, setPreviousSummary] =
    useState<ReviewSummaryResult | null>(null);
  const [pendingSummary, setPendingSummary] =
    useState<ReviewSummaryResult | null>(null);

  const summaryStability = useMemo(
    () => computeSummaryStability(previousSummary, pendingSummary ?? summary),
    [previousSummary, pendingSummary, summary],
  );

  const displayedSummary = pendingSummary ?? summary;
  const canShowDiff = Boolean(previousSummary && pendingSummary);

  const handleRegenerated = (nextSummary: ReviewSummaryResult) => {
    setPreviousSummary(summary);
    setPendingSummary(nextSummary);
    setSummary(nextSummary);
  };

  const handleApprove = () => {
    setPreviousSummary(null);
    setPendingSummary(null);
    toast.success("변경된 요약을 승인했습니다.");
    router.refresh();
  };

  const handleReject = () => {
    if (!previousSummary || isRestoring) {
      return;
    }

    startRestore(async () => {
      const result = await restoreAiReviewSummary(productId, previousSummary);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setSummary(previousSummary);
      setPreviousSummary(null);
      setPendingSummary(null);
      toast.success("이전 요약으로 되돌렸습니다.");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Toaster position="top-center" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <ReviewSummaryConfidence
          className="min-w-0 flex-1"
          reviewCount={stats.reviewCount}
          ratingVariance={stats.ratingVariance}
          averageReviewLength={stats.averageReviewLength}
          summaryStability={summaryStability}
        />
        <RetryReviewSummaryButton
          productId={productId}
          isAdmin={isAdmin}
          onRegenerated={handleRegenerated}
        />
      </div>

      <ReviewSummaryDisplay summary={displayedSummary} />

      {canShowDiff && previousSummary && pendingSummary ? (
        <ReviewSummaryDiff
          previousSummary={previousSummary}
          nextSummary={pendingSummary}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ) : null}
    </div>
  );
};
