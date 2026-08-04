"use server";

import { revalidatePath } from "next/cache";
import { AuthRequiredError } from "@/app/(commerce)/likes/errors";
import { COMMERCE_URLS } from "@/commons/constants/url";
import { createClient } from "@/lib/supabase/server";

export type CreateReviewInput = {
  productId: string;
  rating: number;
  content: string;
};

export type CreateReviewResult = {
  id: string;
};

const MIN_CONTENT_LENGTH = 10;

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

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("별점은 1~5점 사이여야 합니다.");
  }

  if (content.length < MIN_CONTENT_LENGTH) {
    throw new Error(`리뷰 내용은 최소 ${MIN_CONTENT_LENGTH}자 이상이어야 합니다.`);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new AuthRequiredError();
  }

  const { data: existing, error: existingError } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user.id)
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
      user_id: user.id,
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

  // 상품 평균 평점 갱신
  const { data: ratingRows, error: ratingError } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId);

  if (!ratingError && ratingRows && ratingRows.length > 0) {
    const rows = ratingRows as { rating: number }[];
    const average =
      rows.reduce((sum, row) => sum + Number(row.rating), 0) / rows.length;

    await supabase
      .from("products")
      .update({
        rating_average: Number(average.toFixed(2)),
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", productId);
  }

  revalidatePath(COMMERCE_URLS.PRODUCT_DETAIL(productId));
  revalidatePath(COMMERCE_URLS.HOME);
  revalidatePath(COMMERCE_URLS.PRODUCTS);

  return { id: insertedRow.id };
}
