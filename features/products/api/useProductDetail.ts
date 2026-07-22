import type { Product } from "@/components/commerce/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProductStatus = "registered" | "hidden" | "sold_out";

export interface ProductDetailData extends Product {
  description: string | null;
  status: ProductStatus;
}

interface ProductDetailRow {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  status: ProductStatus;
  rating_average: number | null;
}

function mapProductDetailRow(row: ProductDetailRow): ProductDetailData {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    salePrice: row.sale_price != null ? Number(row.sale_price) : undefined,
    imageUrl: row.image_url ?? "",
    status: row.status,
    rating: row.rating_average != null ? Number(row.rating_average) : undefined,
    reviewCount: undefined,
  };
}

/**
 * Supabase products 테이블에서 상품 상세를 조회한다.
 * 없거나 hidden이면 null을 반환한다.
 */
export async function getProductById(
  productId: string,
): Promise<ProductDetailData | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .neq("status", "hidden")
    .maybeSingle();

  if (error) {
    throw new Error(`상품 조회 실패: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapProductDetailRow(data as ProductDetailRow);
}
