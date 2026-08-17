import { createClient } from "@/lib/supabase/server";
import {
  mapReviewRow,
  REVIEW_PAGE_SIZE,
  type ReviewRow,
  type ReviewsPage,
} from "@/features/products/api/product-reviews";

/**
 * 상품 리뷰 목록 1페이지를 서버에서 조회한다.
 */
export async function getProductReviewsPage(
  productId: string,
  pageParam = 0,
): Promise<ReviewsPage> {
  const supabase = await createClient();
  const from = pageParam * REVIEW_PAGE_SIZE;
  const to = from + REVIEW_PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, user_id, rating, content, created_at, users(display_name, image_url)",
    )
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`리뷰 목록 조회 실패: ${error.message}`);
  }

  return {
    items: ((data as ReviewRow[] | null) ?? []).map(mapReviewRow),
  };
}
