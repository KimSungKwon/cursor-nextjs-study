"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  generateAiReviewSummary,
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
import {
  INITIAL_STEPS,
  ReviewSummaryStepIndicator,
  type ReviewSummaryStep,
  type StepStatus,
} from "@/components/commerce/product/ReviewSummaryStepIndicator";
import type { ReviewSummaryResult } from "@/lib/ai/review-summary";
import { Button } from "@/components/ui/Button";
import { FaMagic } from "react-icons/fa";

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

function updateStepStatus(
  steps: ReviewSummaryStep[],
  id: string,
  status: StepStatus,
): ReviewSummaryStep[] {
  return steps.map((step) => (step.id === id ? { ...step, status } : step));
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 신뢰도 · Diff · 재시도 · Agent Step UI가 포함된 AI 리뷰 요약 영역
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [steps, setSteps] = useState<ReviewSummaryStep[]>(INITIAL_STEPS);

  const summaryStability = useMemo(
    () => computeSummaryStability(previousSummary, pendingSummary ?? summary),
    [previousSummary, pendingSummary, summary],
  );

  const displayedSummary = pendingSummary ?? summary;
  const canShowDiff = Boolean(previousSummary && pendingSummary);

  /** 초기 생성 버튼 클릭 시 step UI와 함께 생성 진행 */
  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setSteps(INITIAL_STEPS);

    try {
      // 1. prepare
      setSteps((prev) => updateStepStatus(prev, "prepare", "processing"));
      await sleep(500);
      setSteps((prev) => updateStepStatus(prev, "prepare", "completed"));

      // 2. analyze
      setSteps((prev) => updateStepStatus(prev, "analyze", "processing"));
      await sleep(1000);
      setSteps((prev) => updateStepStatus(prev, "analyze", "completed"));

      // 3. generate — 실제 서버 액션 호출
      setSteps((prev) => updateStepStatus(prev, "generate", "processing"));
      const result = await generateAiReviewSummary(productId);

      if (!result.ok) {
        setSteps((prev) => updateStepStatus(prev, "generate", "failed"));
        toast.error(result.error);
        setIsGenerating(false);
        return;
      }

      // 4. generate + complete → completed
      setSteps((prev) => {
        const afterGenerate = updateStepStatus(prev, "generate", "completed");
        return updateStepStatus(afterGenerate, "complete", "completed");
      });

      await sleep(400);
      setSummary(result.summary);
      toast.success("AI 리뷰 요약이 생성되었습니다.");
    } catch (error) {
      // 현재 processing 중인 단계를 failed로
      setSteps((prev) =>
        prev.map((step) =>
          step.status === "processing" ? { ...step, status: "failed" } : step,
        ),
      );
      toast.error(
        error instanceof Error
          ? error.message
          : "AI 리뷰 요약 생성에 실패했습니다.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

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

      {/* 요약이 없고 생성 중이 아닐 때 — 초기 생성 버튼 */}
      {!displayedSummary && !isGenerating ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <p
            style={{
              fontFamily: "var(--commerce-font-family-body)",
              fontSize: 14,
              color: "var(--commerce-text-tertiary)",
            }}
          >
            아직 AI 요약이 생성되지 않았습니다.
          </p>
          {isAdmin ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<FaMagic size={14} aria-hidden />}
              onClick={handleGenerate}
            >
              AI 요약 생성하기
            </Button>
          ) : null}
        </div>
      ) : null}

      {/* 생성 진행 중 — Step Indicator */}
      {isGenerating ? (
        <div className="flex flex-col gap-6 py-4">
          <p
            style={{
              fontFamily: "var(--commerce-font-family-body)",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--commerce-text-primary)",
            }}
          >
            AI가 리뷰를 분석하고 있습니다...
          </p>
          <ReviewSummaryStepIndicator steps={steps} />
        </div>
      ) : null}

      {/* 요약이 있을 때 — 신뢰도 + 재생성 + 본문 + Diff */}
      {displayedSummary && !isGenerating ? (
        <>
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
        </>
      ) : null}
    </div>
  );
};
