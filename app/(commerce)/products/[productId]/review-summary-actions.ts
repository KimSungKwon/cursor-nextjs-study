"use server";

import { revalidatePath } from "next/cache";
import { COMMERCE_URLS } from "@/commons/constants/url";
import {
  generateFullReviewSummary,
  type ReviewSummaryResult,
} from "@/lib/ai/review-summary";
import { checkAdminAccess } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export type GenerateAiReviewSummaryResult =
  | { ok: true; summary: ReviewSummaryResult }
  | { ok: false; error: string };

type ProductSummaryRow = {
  review_summary: unknown;
};

type ReviewContentRow = {
  rating: number | string | null;
  content: string | null;
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function parseReviewSummary(value: unknown): ReviewSummaryResult | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const { summary, positive_points, negative_points, keywords } = record;

  if (
    typeof summary !== "string" ||
    !summary.trim() ||
    !isStringArray(positive_points) ||
    !isStringArray(negative_points) ||
    !isStringArray(keywords)
  ) {
    return null;
  }

  return {
    summary,
    positive_points,
    negative_points,
    keywords,
  };
}

/**
 * 상품에 저장된 AI 리뷰 요약을 조회한다.
 */
export async function getReviewSummary(
  productId: string,
): Promise<ReviewSummaryResult | null> {
  const trimmedId = productId.trim();
  if (!trimmedId) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("review_summary")
    .eq("id", trimmedId)
    .maybeSingle();

  if (error) {
    throw new Error(`리뷰 요약 조회 실패: ${error.message}`);
  }

  const row = data as ProductSummaryRow | null;
  return parseReviewSummary(row?.review_summary);
}

/**
 * admin이 전체 리뷰를 분석해 products.review_summary를 갱신한다.
 */
export async function generateAiReviewSummary(
  productId: string,
): Promise<GenerateAiReviewSummaryResult> {
  try {
    const trimmedId = productId.trim();
    if (!trimmedId) {
      return { ok: false, error: "상품 정보가 올바르지 않습니다." };
    }

    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return { ok: false, error: "관리자만 AI 리뷰 요약을 생성할 수 있습니다." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("rating, content")
      .eq("product_id", trimmedId)
      .order("created_at", { ascending: false });

    if (error) {
      return { ok: false, error: `리뷰 조회 실패: ${error.message}` };
    }

    const reviews = ((data as ReviewContentRow[] | null) ?? [])
      .map((row) => ({
        rating: Number(row.rating),
        content: row.content?.trim() ?? "",
      }))
      .filter(
        (row) =>
          Number.isFinite(row.rating) &&
          row.rating >= 1 &&
          row.content.length > 0,
      );

    if (reviews.length === 0) {
      return { ok: false, error: "리뷰가 없습니다." };
    }

    const summary = await generateFullReviewSummary(reviews);

    const { error: updateError } = await supabase
      .from("products")
      .update({
        review_summary: summary,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", trimmedId);

    if (updateError) {
      return {
        ok: false,
        error: `리뷰 요약 저장 실패: ${updateError.message}`,
      };
    }

    revalidatePath(COMMERCE_URLS.PRODUCT_DETAIL(trimmedId));

    return { ok: true, summary };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "AI 리뷰 요약 생성 중 오류가 발생했습니다.";
    return { ok: false, error: message };
  }
}

export type ReviewConfidenceStats = {
  reviewCount: number;
  ratingVariance: number;
  averageReviewLength: number;
};

function variance(values: number[]): number {
  if (values.length <= 1) {
    return 0;
  }
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return (
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length
  );
}

/**
 * 신뢰도 계산에 필요한 리뷰 통계를 조회한다.
 */
export async function getReviewConfidenceStats(
  productId: string,
): Promise<ReviewConfidenceStats> {
  const empty = {
    reviewCount: 0,
    ratingVariance: 0,
    averageReviewLength: 0,
  };
  const trimmedId = productId.trim();
  if (!trimmedId) {
    return empty;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("rating, content")
    .eq("product_id", trimmedId);

  if (error) {
    throw new Error(`리뷰 통계 조회 실패: ${error.message}`);
  }

  const reviews = ((data as ReviewContentRow[] | null) ?? [])
    .map((row) => ({
      rating: Number(row.rating),
      content: row.content?.trim() ?? "",
    }))
    .filter(
      (row) =>
        Number.isFinite(row.rating) &&
        row.rating >= 1 &&
        row.content.length > 0,
    );

  if (reviews.length === 0) {
    return empty;
  }

  const ratings = reviews.map((row) => row.rating);
  const totalLength = reviews.reduce((sum, row) => sum + row.content.length, 0);

  return {
    reviewCount: reviews.length,
    ratingVariance: variance(ratings),
    averageReviewLength: totalLength / reviews.length,
  };
}

/**
 * 거부 시 이전 AI 요약을 다시 저장한다.
 */
export async function restoreAiReviewSummary(
  productId: string,
  summary: ReviewSummaryResult,
): Promise<GenerateAiReviewSummaryResult> {
  try {
    const trimmedId = productId.trim();
    if (!trimmedId) {
      return { ok: false, error: "상품 정보가 올바르지 않습니다." };
    }

    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return { ok: false, error: "관리자만 AI 리뷰 요약을 복원할 수 있습니다." };
    }

    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from("products")
      .update({
        review_summary: summary,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", trimmedId);

    if (updateError) {
      return {
        ok: false,
        error: `리뷰 요약 복원 실패: ${updateError.message}`,
      };
    }

    revalidatePath(COMMERCE_URLS.PRODUCT_DETAIL(trimmedId));
    return { ok: true, summary };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "AI 리뷰 요약 복원 중 오류가 발생했습니다.";
    return { ok: false, error: message };
  }
}
