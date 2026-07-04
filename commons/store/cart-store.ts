import type { CartItem } from "@/components/commerce/types";

export interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}
