import type {
  ProductCategory,
  ProductDetail,
  ProductStatus,
} from "@/commons/types/product";
import type { Product } from "@/components/commerce/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type { ProductStatus };

export interface ProductDetailData extends Product {
  description: string | null;
  status: ProductStatus;
  additional_info?: string | null;
  measurements?: string | null;
  categories?: ProductCategory[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface ProductDetailRow {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  status: ProductStatus;
  additional_info: string | null;
  measurements: string | null;
  categories: string[] | null;
  rating_average: number | null;
  created_at: string | null;
  updated_at: string | null;
}

function mapCategories(
  categories: string[] | null,
): ProductCategory[] | null {
  if (!categories || categories.length === 0) {
    return null;
  }

  return categories.map((name, index) => ({
    id: `${index}-${name}`,
    name,
  }));
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
    additional_info: row.additional_info,
    measurements: row.measurements,
    categories: mapCategories(row.categories),
    created_at: row.created_at,
    updated_at: row.updated_at,
    rating: row.rating_average != null ? Number(row.rating_average) : undefined,
    reviewCount: undefined,
  };
}

/** ProductDetailData → ProductInfoSection용 ProductDetail 변환 */
export function toProductDetail(product: ProductDetailData): ProductDetail {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    salePrice: product.salePrice,
    image_url: product.imageUrl || null,
    status: product.status,
    created_at: product.created_at ?? null,
    updated_at: product.updated_at ?? null,
    additional_info: product.additional_info,
    measurements: product.measurements,
    categories: product.categories,
    rating: product.rating,
    reviewCount: product.reviewCount,
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
