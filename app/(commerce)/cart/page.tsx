"use client";

import { useEffect } from "react";
import { useCartStore } from "@/commons/store/cart-store";
import { toast } from "@/commons/utils/toast";
import { CartEmptyState } from "@/components/commerce/CartEmptyState/CartEmptyState";
import { CartItemRow } from "@/components/commerce/CartItemRow/CartItemRow";
import { CartSummary } from "@/components/commerce/CartSummary/CartSummary";

const CartPage = () => {
  const items = useCartStore((state) => state.items);
  const totalAmount = useCartStore((state) => state.totalAmount);
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const setHasHydrated = useCartStore((state) => state.setHasHydrated);

  // persist rehydrate 완료 전에는 로딩 유지 (빈 화면으로 깜빡이지 않음)
  useEffect(() => {
    const markReady = () => setHasHydrated(true);

    const unsub = useCartStore.persist.onFinishHydration(markReady);

    if (useCartStore.persist.hasHydrated()) {
      markReady();
    } else {
      const rehydrateResult = useCartStore.persist.rehydrate();
      if (rehydrateResult && typeof rehydrateResult.then === "function") {
        void rehydrateResult.then(markReady);
      } else {
        markReady();
      }
    }

    const fallbackId = window.setTimeout(markReady, 300);
    return () => {
      unsub();
      window.clearTimeout(fallbackId);
    };
  }, [setHasHydrated]);

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 py-10 sm:px-6 lg:px-10 xl:px-40">
      <h1
        className="mb-10 text-center text-[var(--commerce-text-primary)]"
        style={{
          fontFamily: "var(--commerce-headline-h4-font-family)",
          fontSize: "var(--commerce-headline-h4-font-size)",
          fontWeight: "var(--commerce-headline-h4-font-weight)",
          lineHeight: "44px",
          letterSpacing: "-0.4px",
        }}
      >
        Cart
      </h1>

      {!hasHydrated ? (
        <p
          className="py-16 text-center text-[var(--commerce-text-tertiary)]"
          style={{
            fontFamily: "var(--commerce-body-md-regular-font-family)",
            fontSize: "var(--commerce-body-md-regular-font-size)",
          }}
        >
          장바구니를 불러오는 중...
        </p>
      ) : items.length === 0 ? (
        <CartEmptyState />
      ) : (
        <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <div className="flex min-w-0 flex-1 flex-col">
            <div
              className="mb-2 hidden grid-cols-[1fr_auto] gap-8 border-b border-[var(--commerce-border-light)] pb-2 sm:grid"
              style={{
                fontFamily: "var(--commerce-font-family-body)",
                fontSize: "var(--commerce-caption-sm-regular-font-size)",
                color: "var(--commerce-text-tertiary)",
                lineHeight: "20px",
              }}
            >
              <span>Product</span>
              <div className="flex gap-8 pr-0">
                <span className="w-[88px] text-center">Quantity</span>
                <span className="w-16 text-right">Price</span>
                <span className="w-16 text-right">Subtotal</span>
              </div>
            </div>

            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={{
                  productId: item.id,
                  name: item.name,
                  imageUrl: item.imageUrl ?? "",
                  unitPrice: item.salePrice ?? item.price,
                  quantity: item.quantity,
                }}
                onQuantityChange={(productId, quantity) => {
                  void updateItemQuantity(productId, quantity).catch(
                    (error) => {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "수량 변경에 실패했습니다.",
                      );
                    },
                  );
                }}
                onRemove={(productId) => {
                  void removeItem(productId).catch((error) => {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "삭제에 실패했습니다.",
                    );
                  });
                }}
              />
            ))}
          </div>

          <aside className="w-full shrink-0 lg:w-[413px]">
            <h2
              className="mb-4 text-[var(--commerce-text-secondary)]"
              style={{
                fontFamily:
                  "var(--commerce-headline-h7-font-family, var(--commerce-font-family-body))",
                fontSize: "20px",
                fontWeight: 500,
                lineHeight: "28px",
              }}
            >
              Cart summary
            </h2>
            <CartSummary subtotal={totalAmount} />
          </aside>
        </div>
      )}
    </main>
  );
};

export default CartPage;
