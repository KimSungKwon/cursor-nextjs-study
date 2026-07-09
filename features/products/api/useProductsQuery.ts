"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import type { Product } from "@/components/commerce/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type UseProductsParams = {
  limit?: number;
  search?: string; // 나중에 확장할 여지를 남김
};

interface ProductRow {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  rating_average: number | null;
}

function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    salePrice: row.sale_price != null ? Number(row.sale_price) : undefined,
    imageUrl: row.image_url ?? "",
    rating: row.rating_average != null ? Number(row.rating_average) : undefined,
    reviewCount: undefined, // 나중에 별도 조회 필요
  };
}

/**
 * Supabase products 테이블에서 상품 목록을 조회하는 React Query 훅
 *
 * @example
 * const { data: products, isLoading, isError } = useProductsQuery({ limit: 20 });
 * if (isLoading) return <div>로딩 중...</div>;
 * if (isError) return <div>오류 발생</div>;
 * return <ProductGrid products={products ?? []} />;
 */
export function useProductsQuery(params?: UseProductsParams) {
  return useQuery<Product[]>({
    queryKey: QUERY_KEYS.products.list(params || {}),
    enabled: true,
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();

      let query = supabase.from("products").select("*").neq("status", "hidden");

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      // TODO: params.search로 상품명 검색 필터 구현

      const { data, error } = await query;

      if (error) {
        throw new Error(`상품 목록 조회 실패: ${error.message}`);
      }

      return (data as ProductRow[]).map(mapProductRow);
    },
  });
}
