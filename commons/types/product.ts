export type ProductStatus = "registered" | "hidden" | "sold_out";

export interface ProductCategory {
  id: string;
  name: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  description: string | null;
  price: number;
  salePrice?: number;
  image_url: string | null;
  status: ProductStatus;
  created_at: string | null;
  updated_at: string | null;
  additional_info?: string | null;
  measurements?: string | null;
  categories?: ProductCategory[] | null;
  rating?: number;
  reviewCount?: number;
}
