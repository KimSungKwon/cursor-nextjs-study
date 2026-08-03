"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import type { Product } from "@/components/commerce/types";
import { getLikedProductIdSet } from "@/features/likes/api/getLikedProductIds";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const PAGE_SIZE = 12;

export type ProductsPage = {
  items: Product[];
};

interface ProductRow {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  rating_average: number | null;
}

function mapProductRow(row: ProductRow, likedIds: Set<string>): Product {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    salePrice: row.sale_price != null ? Number(row.sale_price) : undefined,
    imageUrl: row.image_url ?? "",
    rating: row.rating_average != null ? Number(row.rating_average) : undefined,
    reviewCount: undefined,
    isLiked: likedIds.has(row.id),
  };
}

/**
 * Supabase products 테이블을 무한 스크롤로 조회하는 React Query 훅
 *
 * @example
 * const {
 *   data,
 *   isLoading,
 *   hasNextPage,
 *   fetchNextPage,
 *   isFetchingNextPage,
 * } = useInfiniteProducts();
 * const products = data?.pages.flatMap((page) => page.items) ?? [];
 */
export function useInfiniteProducts() {
  return useInfiniteQuery<ProductsPage, Error>({
    queryKey: [...QUERY_KEYS.products.all, "infinite"] as const,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === "number" ? pageParam : 0;
      const offset = page * PAGE_SIZE;
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .neq("status", "hidden")
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) {
        throw new Error(`상품 목록 조회 실패: ${error.message}`);
      }

      const rows = (data ?? []) as ProductRow[];
      const likedIds = await getLikedProductIdSet(
        supabase,
        rows.map((row) => row.id),
      );

      return {
        items: rows.map((row) => mapProductRow(row, likedIds)),
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.items.length < PAGE_SIZE) {
        return undefined;
      }
      return allPages.length;
    },
  });
}
