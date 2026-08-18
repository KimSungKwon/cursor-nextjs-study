export type ConfidenceFactors = {
  reviewCount: number;
  ratingVariance: number;
  averageReviewLength: number;
  summaryStability: number;
};

export type ConfidenceLevel = "high" | "medium" | "low";

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

function scoreReviewCount(count: number): number {
  return clamp01(count / 10);
}

function scoreRatingConsistency(variance: number): number {
  return clamp01(1 - variance / 4);
}

function scoreAverageLength(length: number): number {
  return clamp01(length / 80);
}

function scoreStability(stability: number): number {
  return clamp01(stability);
}

export function getFactorScores(factors: ConfidenceFactors): {
  reviewCount: number;
  ratingConsistency: number;
  averageReviewLength: number;
  summaryStability: number;
} {
  return {
    reviewCount: scoreReviewCount(factors.reviewCount),
    ratingConsistency: scoreRatingConsistency(factors.ratingVariance),
    averageReviewLength: scoreAverageLength(factors.averageReviewLength),
    summaryStability: scoreStability(factors.summaryStability),
  };
}

/**
 * 리뷰 개수(40%) + 별점 일관성(20%) + 평균 길이(20%) + 요약 안정성(20%)으로 0~1 점수를 계산한다.
 */
export function calculateConfidence(factors: ConfidenceFactors): number {
  const scores = getFactorScores(factors);
  return clamp01(
    scores.reviewCount * 0.4 +
      scores.ratingConsistency * 0.2 +
      scores.averageReviewLength * 0.2 +
      scores.summaryStability * 0.2,
  );
}

/**
 * 신뢰도 구간을 반환한다. 0.7 이상 high, 0.4 이상 medium, 미만 low.
 */
export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.7) {
    return "high";
  }
  if (confidence >= 0.4) {
    return "medium";
  }
  return "low";
}
