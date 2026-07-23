"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type ProductRatingData = {
  rating: number;
  reviewCount: number;
};

type ProductRatingRow = {
  rating_average: number | null;
  reviews: { count: number }[] | null;
};

/**
 * 상품 평균 별점(rating_average)과 리뷰 수(reviews.count)를 조회한다.
 */
export function useProductRating(productId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.products.detail(productId), "rating"] as const,
    enabled: Boolean(productId),
    queryFn: async (): Promise<ProductRatingData> => {
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("products")
        .select("rating_average, reviews(count)")
        .eq("id", productId)
        .single();

      if (error) {
        throw new Error(`상품 평점 조회 실패: ${error.message}`);
      }

      const row = data as ProductRatingRow;
      const reviewCount = row.reviews?.[0]?.count ?? 0;
      const rating =
        reviewCount > 0 && row.rating_average != null
          ? Number(row.rating_average)
          : 0;

      return { rating, reviewCount };
    },
  });
}
