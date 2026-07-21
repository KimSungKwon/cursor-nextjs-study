"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/commons/hooks/useDebouncedValue";
import type { Product } from "@/components/commerce/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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
    reviewCount: undefined,
  };
}

/**
 * 상품명/설명 기준 검색 훅 (350ms 디바운스)
 *
 * @example
 * const { data: products, isLoading, isError } = useProductSearch(keyword);
 */
export function useProductSearch(keyword: string) {
  const debouncedKeyword = useDebouncedValue(keyword.trim(), 350);

  return useQuery<Product[]>({
    queryKey: ["products", "search", debouncedKeyword],
    enabled: debouncedKeyword.length > 0,
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .or(
          `name.ilike.%${debouncedKeyword}%,description.ilike.%${debouncedKeyword}%`,
        )
        .neq("status", "hidden");

      if (error) {
        throw new Error(`상품 검색 실패: ${error.message}`);
      }

      return (data as ProductRow[]).map(mapProductRow);
    },
  });
}
