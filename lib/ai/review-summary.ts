import { generateGeminiTextWithSystemPrompt } from "@/lib/ai/gemini";

export interface ReviewSummaryResult {
  summary: string;
  positive_points: string[];
  negative_points: string[];
  keywords: string[];
}

type ReviewInput = {
  rating: number;
  content: string;
};

const JSON_OUTPUT_SCHEMA = `{
  "summary": "전체 리뷰를 2-3줄로 요약한 텍스트",
  "positive_points": ["긍정적인 포인트 1", "긍정적인 포인트 2", "..."],
  "negative_points": ["부정적인 포인트 1", "부정적인 포인트 2", "..."],
  "keywords": ["키워드1", "키워드2", "키워드3"]
}`;

const SHARED_SYSTEM_PROMPT = `당신은 전자상거래 플랫폼의 리뷰 요약 전문가입니다.
출력 형식은 반드시 아래 JSON 형식만 반환하세요. 마크다운이나 추가 설명은 절대 포함하지 마세요.

${JSON_OUTPUT_SCHEMA}

주의사항:
- summary는 2-3줄로 간결하게 작성
- positive_points, negative_points는 각각 최대 5개
- keywords는 3-5개
- 반드시 한글로 작성`;

const INCREMENTAL_SYSTEM_PROMPT = `${SHARED_SYSTEM_PROMPT}
기존 요약과 새로운 리뷰를 결합하여 업데이트된 요약을 생성하세요.`;

const FULL_SYSTEM_PROMPT = `${SHARED_SYSTEM_PROMPT}
제공된 모든 리뷰를 분석하여 종합적인 요약을 생성하세요.`;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/**
 * Gemini 응답 텍스트에서 JSON을 추출해 ReviewSummaryResult로 파싱한다.
 * @param text Gemini 원본 응답
 * @returns 파싱된 리뷰 요약 결과
 */
function parseJSONResponse(text: string): ReviewSummaryResult {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed: unknown = JSON.parse(withoutFence);

    if (!parsed || typeof parsed !== "object") {
      throw new Error("필수 필드가 누락되었습니다.");
    }

    const record = parsed as Record<string, unknown>;
    const { summary, positive_points, negative_points, keywords } = record;

    if (
      typeof summary !== "string" ||
      !isStringArray(positive_points) ||
      !isStringArray(negative_points) ||
      !isStringArray(keywords)
    ) {
      throw new Error("필수 필드가 누락되었습니다.");
    }

    return {
      summary,
      positive_points,
      negative_points,
      keywords,
    };
  } catch (error) {
    console.error("[parseJSONResponse] JSON 파싱 실패:", error);
    console.error("[parseJSONResponse] 원본 텍스트:", text);
    throw error;
  }
}

function formatExistingSummary(existingSummary: ReviewSummaryResult): string {
  return `기존 요약:
요약: ${existingSummary.summary}
긍정 포인트: ${existingSummary.positive_points.join(", ")}
부정 포인트: ${existingSummary.negative_points.join(", ")}
키워드: ${existingSummary.keywords.join(", ")}`;
}

function buildIncrementalUserPrompt(
  existingSummary: ReviewSummaryResult | null,
  newReview: ReviewInput,
): string {
  const existingBlock = existingSummary
    ? formatExistingSummary(existingSummary)
    : "기존 요약이 없습니다. 이것이 첫 번째 리뷰입니다.";

  return `${existingBlock}

새 리뷰:
별점: ${newReview.rating}/5
내용: ${newReview.content}

위 정보를 바탕으로 업데이트된 요약을 JSON 형식으로 생성해주세요.`;
}

function buildFullUserPrompt(reviews: ReviewInput[]): string {
  const reviewBlocks = reviews
    .map(
      (review, index) =>
        `리뷰 ${index + 1}:
별점: ${review.rating}/5
내용: ${review.content}`,
    )
    .join("\n\n");

  return `${reviewBlocks}

위 리뷰들을 종합적으로 분석하여 요약을 JSON 형식으로 생성해주세요.`;
}

/**
 * 기존 요약에 새 리뷰를 반영해 증분 요약을 생성한다.
 * @param existingSummary 기존 요약 (없으면 null)
 * @param newReview 새로 작성된 리뷰
 * @returns 업데이트된 리뷰 요약
 */
export async function generateIncrementalReviewSummary(
  existingSummary: ReviewSummaryResult | null,
  newReview: ReviewInput,
): Promise<ReviewSummaryResult> {
  const userPrompt = buildIncrementalUserPrompt(existingSummary, newReview);
  const response = await generateGeminiTextWithSystemPrompt(
    INCREMENTAL_SYSTEM_PROMPT,
    userPrompt,
  );
  return parseJSONResponse(response);
}

/**
 * 전체 리뷰 목록을 한 번에 분석해 종합 요약을 생성한다.
 * @param reviews 분석할 리뷰 목록
 * @returns 종합 리뷰 요약
 */
export async function generateFullReviewSummary(
  reviews: ReviewInput[],
): Promise<ReviewSummaryResult> {
  if (reviews.length === 0) {
    throw new Error("리뷰가 없습니다.");
  }

  const userPrompt = buildFullUserPrompt(reviews);
  const response = await generateGeminiTextWithSystemPrompt(
    FULL_SYSTEM_PROMPT,
    userPrompt,
  );
  return parseJSONResponse(response);
}
