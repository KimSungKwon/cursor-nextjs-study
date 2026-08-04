"use server";

import { revalidatePath } from "next/cache";
import {
  AuthRequiredError,
  ForbiddenError,
  NotFoundError,
} from "@/app/(commerce)/likes/errors";
import { COMMERCE_URLS } from "@/commons/constants/url";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export type CreateReviewInput = {
  productId: string;
  rating: number;
  content: string;
};

export type CreateReviewResult = {
  id: string;
};

export type UpdateReviewInput = {
  reviewId: string;
  productId: string;
  rating: number;
  content: string;
};

export type DeleteReviewInput = {
  reviewId: string;
  productId: string;
};

const MIN_CONTENT_LENGTH = 10;

type ReviewOwnerRow = {
  id: string;
  user_id: string;
  product_id: string;
};

function revalidateReviewPaths(productId: string): void {
  revalidatePath(COMMERCE_URLS.PRODUCT_DETAIL(productId));
  revalidatePath(COMMERCE_URLS.HOME);
  revalidatePath(COMMERCE_URLS.PRODUCTS);
}

async function requireUserId(
  supabase: SupabaseClient,
): Promise<string> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new AuthRequiredError();
  }

  return user.id;
}

function validateRating(rating: number): void {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("별점은 1~5점 사이여야 합니다.");
  }
}

function validateContent(content: string): void {
  if (content.length < MIN_CONTENT_LENGTH) {
    throw new Error(
      `리뷰 내용은 최소 ${MIN_CONTENT_LENGTH}자 이상이어야 합니다.`,
    );
  }
}

async function getReviewOrThrow(
  supabase: SupabaseClient,
  reviewId: string,
): Promise<ReviewOwnerRow> {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, user_id, product_id")
    .eq("id", reviewId)
    .maybeSingle();

  if (error) {
    throw new Error(`리뷰 조회 실패: ${error.message}`);
  }

  const row = data as ReviewOwnerRow | null;
  if (!row) {
    throw new NotFoundError("리뷰를 찾을 수 없습니다.");
  }

  return row;
}

function assertOwnReview(review: ReviewOwnerRow, userId: string): void {
  if (review.user_id !== userId) {
    throw new ForbiddenError("본인의 리뷰만 수정/삭제할 수 있습니다.");
  }
}

async function refreshProductRating(
  supabase: SupabaseClient,
  productId: string,
): Promise<void> {
  const { data: ratingRows, error: ratingError } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId);

  if (ratingError) {
    return;
  }

  const rows = (ratingRows as { rating: number }[] | null) ?? [];
  const average =
    rows.length > 0
      ? rows.reduce((sum, row) => sum + Number(row.rating), 0) / rows.length
      : 0;

  await supabase
    .from("products")
    .update({
      rating_average: Number(average.toFixed(2)),
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", productId);
}

/**
 * 상품 리뷰를 생성한다.
 */
export async function createReview(
  input: CreateReviewInput,
): Promise<CreateReviewResult> {
  const productId = input.productId?.trim();
  const content = input.content?.trim() ?? "";
  const rating = Number(input.rating);

  if (!productId) {
    throw new Error("상품 정보가 올바르지 않습니다.");
  }

  validateRating(rating);
  validateContent(content);

  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  const { data: existing, error: existingError } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existingError) {
    throw new Error(`리뷰 중복 확인 실패: ${existingError.message}`);
  }

  if (existing) {
    throw new Error("이미 이 상품에 리뷰를 작성하셨습니다.");
  }

  const { data: inserted, error: insertError } = await supabase
    .from("reviews")
    .insert({
      user_id: userId,
      product_id: productId,
      rating,
      content,
    } as never)
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      throw new Error("이미 이 상품에 리뷰를 작성하셨습니다.");
    }
    throw new Error(`리뷰 등록 실패: ${insertError.message}`);
  }

  const insertedRow = inserted as { id: string } | null;
  if (!insertedRow?.id) {
    throw new Error("리뷰 등록 결과를 확인할 수 없습니다.");
  }

  await refreshProductRating(supabase, productId);
  revalidateReviewPaths(productId);

  return { id: insertedRow.id };
}

/**
 * 본인 리뷰를 수정한다.
 */
export async function updateReview(input: UpdateReviewInput): Promise<void> {
  const reviewId = input.reviewId?.trim();
  const productId = input.productId?.trim();
  const content = input.content?.trim() ?? "";
  const rating = Number(input.rating);

  if (!reviewId || !productId) {
    throw new Error("리뷰 정보가 올바르지 않습니다.");
  }

  validateRating(rating);
  validateContent(content);

  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  const review = await getReviewOrThrow(supabase, reviewId);

  if (review.product_id !== productId) {
    throw new NotFoundError("리뷰를 찾을 수 없습니다.");
  }

  assertOwnReview(review, userId);

  const { data: updated, error: updateError } = await supabase
    .from("reviews")
    .update({
      rating,
      content,
    } as never)
    .eq("id", reviewId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (updateError) {
    throw new Error(`리뷰 수정 실패: ${updateError.message}`);
  }

  if (!updated) {
    throw new ForbiddenError("본인의 리뷰만 수정/삭제할 수 있습니다.");
  }

  await refreshProductRating(supabase, productId);
  revalidateReviewPaths(productId);
}

/**
 * 본인 리뷰를 삭제한다.
 */
export async function deleteReview(input: DeleteReviewInput): Promise<void> {
  const reviewId = input.reviewId?.trim();
  const productId = input.productId?.trim();

  if (!reviewId || !productId) {
    throw new Error("리뷰 정보가 올바르지 않습니다.");
  }

  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  const review = await getReviewOrThrow(supabase, reviewId);

  if (review.product_id !== productId) {
    throw new NotFoundError("리뷰를 찾을 수 없습니다.");
  }

  assertOwnReview(review, userId);

  const { data: deleted, error: deleteError } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    throw new Error(`리뷰 삭제 실패: ${deleteError.message}`);
  }

  if (!deleted) {
    throw new ForbiddenError("본인의 리뷰만 수정/삭제할 수 있습니다.");
  }

  await refreshProductRating(supabase, productId);
  revalidateReviewPaths(productId);
}
