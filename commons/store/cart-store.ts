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

export type SyncWithServerOptions = {
  /** true면 로컬 항목을 서버에 합산(POST)한 뒤 GET. 로그인 직후 1회만 사용 */
  mergeLocal?: boolean;
};

/** 무료 배송 기준 금액 (5만원) */
export const FREE_SHIPPING_THRESHOLD = 50_000;

/** 기본 배송비 */
export const DEFAULT_SHIPPING_FEE = 2_500;

/**
 * 소계 기준 배송비 계산
 * - subtotal >= 50,000 → 0원 (무료)
 * - subtotal < 50,000 → 2,500원
 */
export function calcShippingFee(subtotal: number): number {
  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    return 0;
  }
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE;
}

export interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setItems: (items: CartItem[]) => void;
  /** 상품 소계 (totalAmount와 동일) */
  getSubtotal: () => number;
  getShippingFee: () => number;
  getTotal: () => number;
  syncWithServer: (options?: SyncWithServerOptions) => Promise<void>;
  addItem: (product: CartProductInput, quantity?: number) => Promise<void>;
  updateItemQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clear: () => void;
}

const STORAGE_KEY = "commerce_cart_v1";
const CART_API = "/api/cart";

type CartApiResponse = {
  items?: CartItem[];
  error?: string;
};

function getEffectivePrice(item: CartItem): number {
  return item.salePrice ?? item.price;
}

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

function normalizeItems(items: CartItem[]): CartItem[] {
  return items.map((item) => ({
    ...item,
    price: Number(item.price),
    salePrice: item.salePrice == null ? null : Number(item.salePrice),
    quantity: Number(item.quantity),
    imageUrl: item.imageUrl ?? null,
  }));
}

async function cartFetch(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: Record<string, unknown>,
  productId?: string,
): Promise<{ status: number; data: CartApiResponse }> {
  const url =
    method === "DELETE" && productId
      ? `${CART_API}?productId=${encodeURIComponent(productId)}`
      : CART_API;

  const response = await fetch(url, {
    method,
    credentials: "same-origin",
    headers:
      body && method !== "GET"
        ? { "Content-Type": "application/json" }
        : undefined,
    body: body && method !== "GET" ? JSON.stringify(body) : undefined,
  });

  let data: CartApiResponse = {};
  try {
    data = (await response.json()) as CartApiResponse;
  } catch {
    data = {};
  }

  return { status: response.status, data };
}

function applyLocalAdd(
  items: CartItem[],
  product: CartProductInput,
  quantity: number,
): CartItem[] {
  const existing = items.find((item) => item.id === product.id);
  if (existing) {
    return items.map((item) =>
      item.id === product.id
        ? { ...item, quantity: item.quantity + quantity }
        : item,
    );
  }
  return [...items, { ...product, quantity }];
}

function applyLocalQuantity(
  items: CartItem[],
  productId: string,
  quantity: number,
): CartItem[] {
  if (quantity <= 0) {
    return items.filter((item) => item.id !== productId);
  }
  return items.map((item) =>
    item.id === productId ? { ...item, quantity } : item,
  );
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalQuantity: 0,
      totalAmount: 0,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      setItems: (items) => {
        const normalized = normalizeItems(items);
        set({ items: normalized, ...calculateTotals(normalized) });
      },

      getSubtotal: () => get().totalAmount,

      getShippingFee: () => calcShippingFee(get().totalAmount),

      getTotal: () => {
        const subtotal = get().totalAmount;
        return subtotal + calcShippingFee(subtotal);
      },

      syncWithServer: async (options) => {
        const mergeLocal = options?.mergeLocal === true;

        if (mergeLocal) {
          const localItems = get().items;
          for (const item of localItems) {
            const { status, data } = await cartFetch("POST", {
              productId: item.id,
              quantity: item.quantity,
            });
            if (status === 401) {
              return;
            }
            if (status >= 400) {
              throw new Error(
                data.error ?? "장바구니 서버 동기화에 실패했습니다.",
              );
            }
          }
        }

        const { status, data } = await cartFetch("GET");
        if (status === 401) {
          return;
        }
        if (status >= 400) {
          throw new Error(data.error ?? "장바구니 조회에 실패했습니다.");
        }

        get().setItems(data.items ?? []);
      },

      addItem: async (product, quantity = 1) => {
        if (!Number.isFinite(quantity) || quantity <= 0) {
          return;
        }

        const previous = get().items;
        const optimistic = applyLocalAdd(previous, product, quantity);
        set({ items: optimistic, ...calculateTotals(optimistic) });

        const { status, data } = await cartFetch("POST", {
          productId: product.id,
          quantity,
        });

        if (status === 401) {
          return;
        }

        if (status >= 400) {
          set({ items: previous, ...calculateTotals(previous) });
          throw new Error(data.error ?? "장바구니 추가에 실패했습니다.");
        }

        if (data.items) {
          get().setItems(data.items);
        }
      },

      updateItemQuantity: async (productId, quantity) => {
        const previous = get().items;
        const optimistic = applyLocalQuantity(previous, productId, quantity);
        set({ items: optimistic, ...calculateTotals(optimistic) });

        const { status, data } = await cartFetch("PATCH", {
          productId,
          quantity,
        });

        if (status === 401) {
          return;
        }

        if (status >= 400) {
          set({ items: previous, ...calculateTotals(previous) });
          throw new Error(data.error ?? "장바구니 수량 변경에 실패했습니다.");
        }

        if (data.items) {
          get().setItems(data.items);
        }
      },

      removeItem: async (productId) => {
        const previous = get().items;
        const optimistic = previous.filter((item) => item.id !== productId);
        set({ items: optimistic, ...calculateTotals(optimistic) });

        const { status, data } = await cartFetch(
          "DELETE",
          undefined,
          productId,
        );

        if (status === 401) {
          return;
        }

        if (status >= 400) {
          set({ items: previous, ...calculateTotals(previous) });
          throw new Error(data.error ?? "장바구니 삭제에 실패했습니다.");
        }

        if (data.items) {
          get().setItems(data.items);
        }
      },

      clear: () => set({ items: [], totalQuantity: 0, totalAmount: 0 }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state, error) => {
        // rehydrate 직후 합계·hydrate 플래그를 동기 반영 (set 호출은 microtask로 구독 보장)
        const totals =
          !error && state
            ? calculateTotals(state.items)
            : { totalQuantity: 0, totalAmount: 0 };

        if (!error && state) {
          state.totalQuantity = totals.totalQuantity;
          state.totalAmount = totals.totalAmount;
          state.hasHydrated = true;
        }

        queueMicrotask(() => {
          useCartStore.setState({
            hasHydrated: true,
            ...(!error && state
              ? {
                  totalQuantity: totals.totalQuantity,
                  totalAmount: totals.totalAmount,
                }
              : {}),
          });
        });
      },
    },
  ),
);
