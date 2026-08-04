"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const REVIEW_PAGE_SIZE = 5;

export type ProductReviewItem = {
  id: string;
  userId: string;
  rating: number;
  content: string;
  createdAt: string;
  authorName: string;
  avatarUrl?: string;
};

type ReviewRow = {
  id: string;
  user_id: string;
  rating: number;
  content: string | null;
  created_at: string;
  users:
    | { display_name: string | null }
    | { display_name: string | null }[]
    | null;
};

type ReviewsPage = {
  items: ProductReviewItem[];
};

const mapAuthorName = (users: ReviewRow["users"]): string => {
  if (!users) return "Anonymous";
  const user = Array.isArray(users) ? users[0] : users;
  return user?.display_name?.trim() || "Anonymous";
};

const mapReviewRow = (row: ReviewRow): ProductReviewItem => {
  return {
    id: row.id,
    userId: row.user_id,
    rating: Number(row.rating),
    content: row.content?.trim() || "",
    createdAt: row.created_at,
    authorName: mapAuthorName(row.users),
  };
};

/**
 * 상품 리뷰 목록을 페이지 단위로 조회한다.
 */
export const useProductReviews = (productId: string) => {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.products.reviews(productId),
    enabled: Boolean(productId),
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<ReviewsPage> => {
      const supabase = getSupabaseBrowserClient();
      const from = pageParam * REVIEW_PAGE_SIZE;
      const to = from + REVIEW_PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("reviews")
        .select("id, user_id, rating, content, created_at, users(display_name)")
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
