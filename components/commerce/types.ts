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

export function formatCommercePrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}