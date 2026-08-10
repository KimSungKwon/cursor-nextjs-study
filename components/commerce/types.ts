export interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  isLiked?: boolean;
  isNew?: boolean;
  discountPercent?: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  quantity: number;
  optionLabel?: string;
}

export interface ShippingOption {
  id: string;
  label: string;
  price: number;
}

/** public.users 프로필 (마이페이지) */
export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  /** 프로필 이미지 URL 또는 data URL */
  imageUrl: string | null;
  role: "user" | "admin";
}

export function formatCommercePrice(value: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(value);
}