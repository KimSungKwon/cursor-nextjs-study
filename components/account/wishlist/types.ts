import type { ProductStatus } from "@/commons/types/product";

export const WISHLIST_PAGE_SIZE = 5;

export type WishlistProduct = {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  imageUrl: string | null;
  status: ProductStatus;
};

export type WishlistItem = {
  likeId: string;
  createdAt: string;
  product: WishlistProduct;
};

export type WishlistListResult = {
  items: WishlistItem[];
  totalCount: number;
  page: number;
  totalPages: number;
};

export function formatWishlistStatus(status: ProductStatus): string {
  switch (status) {
    case "sold_out":
      return "Sold Out";
    case "hidden":
      return "Hidden";
    case "registered":
    default:
      return "Active";
  }
}
