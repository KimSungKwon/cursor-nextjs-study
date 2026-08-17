"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import {
  mapReviewRow,
  REVIEW_PAGE_SIZE,
  type ProductReviewItem,
  type ReviewsPage,
  type ReviewRow,
} from "@/features/products/api/product-reviews";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export { REVIEW_PAGE_SIZE };
export type { ProductReviewItem };

/**
 * 상품 리뷰 목록을 페이지 단위로 조회한다.
 */
export const useProductReviews = (
  productId: string,
  initialItems?: ProductReviewItem[],
) => {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.products.reviews(productId),
    enabled: Boolean(productId),
    initialPageParam: 0,
    initialData:
      initialItems === undefined
        ? undefined
        : {
            pages: [{ items: initialItems }],
            pageParams: [0],
          },
    queryFn: async ({ pageParam }): Promise<ReviewsPage> => {
      const supabase = getSupabaseBrowserClient();
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
    },
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      if (lastPage.items.length < REVIEW_PAGE_SIZE) {
        return undefined;
      }
      return lastPageParam + 1;
    },
  });
};
