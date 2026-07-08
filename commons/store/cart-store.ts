import { create } from "zustand";
import { persist } from "zustand/middleware";

// Supabase products 테이블과 매핑되는 상품 상태
export type ProductStatus = "registered" | "hidden" | "sold_out";

// 장바구니 항목 (products 테이블 컬럼과 매핑)
export interface CartItem {
  id: string; // products.id
  name: string;
  price: number; // products.price
  quantity: number;
  imageUrl: string | null; // products.image_url
  salePrice: number | null; // products.sale_price
  status?: ProductStatus;
}

// addItem에 전달되는 상품 정보 (quantity 제외)
export type CartProductInput = Omit<CartItem, "quantity">;

export interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  addItem: (product: CartProductInput, quantity?: number) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "commerce_cart_v1";

// 항목의 실제 적용 단가 (salePrice 우선, 없으면 price)
function getEffectivePrice(item: CartItem): number {
  return item.salePrice ?? item.price;
}

// items를 기반으로 총 수량/총 금액을 재계산
function calculateTotals(items: CartItem[]): {
  totalQuantity: number;
  totalAmount: number;
} {
  return items.reduce(
    (acc, item) => {
      acc.totalQuantity += item.quantity;
      acc.totalAmount += getEffectivePrice(item) * item.quantity;
      return acc;
    },
    { totalQuantity: 0, totalAmount: 0 },
  );
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      totalQuantity: 0,
      totalAmount: 0,

      // 상품 추가: 동일 id가 있으면 수량만 증가, 없으면 새 항목 추가
      addItem: (product, quantity = 1) =>
        set((state) => {
          // 잘못된 수량 방어
          if (!Number.isFinite(quantity) || quantity <= 0) {
            return state;
          }

          const existing = state.items.find((item) => item.id === product.id);

          const items = existing
            ? state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              )
            : [...state.items, { ...product, quantity }];

          return { items, ...calculateTotals(items) };
        }),

      // 수량 변경: 0 이하가 되면 항목 제거
      updateItemQuantity: (productId, quantity) =>
        set((state) => {
          const items =
            quantity <= 0
              ? state.items.filter((item) => item.id !== productId)
              : state.items.map((item) =>
                  item.id === productId ? { ...item, quantity } : item,
                );

          return { items, ...calculateTotals(items) };
        }),

      // 특정 항목 제거
      removeItem: (productId) =>
        set((state) => {
          const items = state.items.filter((item) => item.id !== productId);
          return { items, ...calculateTotals(items) };
        }),

      // 장바구니 비우기
      clear: () => set({ items: [], totalQuantity: 0, totalAmount: 0 }),
    }),
    {
      name: STORAGE_KEY,
      // items만 저장하고, 복원 시 합계는 재계산해 데이터 정합성 유지
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const { totalQuantity, totalAmount } = calculateTotals(state.items);
          state.totalQuantity = totalQuantity;
          state.totalAmount = totalAmount;
        }
      },
    },
  ),
);
