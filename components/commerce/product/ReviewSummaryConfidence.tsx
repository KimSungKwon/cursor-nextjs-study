"use client";

import { useState } from "react";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";
import {
  calculateConfidence,
  getConfidenceLevel,
  getFactorScores,
  type ConfidenceFactors,
  type ConfidenceLevel,
} from "@/lib/ai/confidence";

export type ReviewSummaryConfidenceProps = ConfidenceFactors & {
  className?: string;
};

const LEVEL_COLOR: Record<ConfidenceLevel, string> = {
  high: commerceColors.semantic.success,
  medium: commerceColors.semantic.warning,
  low: commerceColors.semantic.error,
};

const LEVEL_LABEL: Record<ConfidenceLevel, string> = {
  high: "높음",
  medium: "보통",
  low: "낮음",
};

/**
 * AI 리뷰 요약 신뢰도 바
 */
export const ReviewSummaryConfidence = ({
  reviewCount,
  ratingVariance,
  averageReviewLength,
  summaryStability,
  className,
}: ReviewSummaryConfidenceProps) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const factors: ConfidenceFactors = {
    reviewCount,
    ratingVariance,
    averageReviewLength,
    summaryStability,
  };
  const confidence = calculateConfidence(factors);
  const level = getConfidenceLevel(confidence);
  const color = LEVEL_COLOR[level];
  const percent = Math.round(confidence * 100);
  const scores = getFactorScores(factors);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <p
          style={{
            fontFamily: commerceTypography.fontFamily.body,
            fontSize: commerceTypography.caption.md.regular.fontSize,
            fontWeight: commerceTypography.fontWeight.semibold,
            lineHeight: "22px",
            color: commerceColors.text.secondary,
          }}
        >
          신뢰도 {LEVEL_LABEL[level]} · {percent}%
        </p>
        <button
          type="button"
          className="text-left transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            fontFamily: commerceTypography.fontFamily.body,
            fontSize: commerceTypography.caption.md.regular.fontSize,
            color: commerceColors.text.tertiary,
            outlineColor: commerceColors.primary.main,
          }}
          aria-expanded={isDetailOpen}
          onClick={() => setIsDetailOpen((open) => !open)}
        >
          {isDetailOpen ? "상세 닫기" : "상세 보기"}
        </button>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: commerceColors.background.light }}
        role="meter"
        aria-label="AI 요약 신뢰도"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>

      {isDetailOpen ? (
        <ul className="flex flex-col gap-1" aria-label="신뢰도 상세">
          <FactorRow label="리뷰 개수" value={scores.reviewCount} raw={`${reviewCount}개`} />
          <FactorRow
            label="별점 일관성"
            value={scores.ratingConsistency}
            raw={`분산 ${ratingVariance.toFixed(2)}`}
          />
          <FactorRow
            label="평균 리뷰 길이"
            value={scores.averageReviewLength}
            raw={`${Math.round(averageReviewLength)}자`}
          />
          <FactorRow
            label="요약 안정성"
            value={scores.summaryStability}
            raw={`${Math.round(scores.summaryStability * 100)}%`}
          />
        </ul>
      ) : null}
    </div>
  );
};

type FactorRowProps = {
  label: string;
  value: number;
  raw: string;
};

const FactorRow = ({ label, value, raw }: FactorRowProps) => {
  return (
    <li
      className="flex items-center justify-between gap-3"
      style={{
        fontFamily: commerceTypography.fontFamily.body,
        fontSize: commerceTypography.caption.md.regular.fontSize,
        lineHeight: "22px",
        color: commerceColors.text.tertiary,
      }}
    >
      <span>{label}</span>
      <span>
        {Math.round(value * 100)}% · {raw}
      </span>
    </li>
  );
};
