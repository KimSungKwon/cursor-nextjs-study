"use client";

import { useMemo, type HTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import { commerceColors } from "@/commons/constants/color";
import { ACCOUNT_URLS, AUTH_URLS } from "@/commons/constants/url";
import { useAuth } from "@/commons/hooks/useAuth";
import {
  calcShippingFee,
  DEFAULT_SHIPPING_FEE,
} from "@/commons/store/cart-store";
import { cn } from "@/commons/utils/cn";
import { OrderSummaryPanel } from "@/components/commerce/OrderSummaryPanel/OrderSummaryPanel";
import type { ShippingOption } from "@/components/commerce/types";

export type CartSummaryProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> & {
  subtotal: number;
};

function buildShippingOptions(subtotal: number): ShippingOption[] {
  const autoFee = calcShippingFee(subtotal);

  // 무료 배송 기준 충족: Free shipping만 노출
  if (autoFee === 0 && subtotal > 0) {
    return [{ id: "free", label: "Free shipping", price: 0 }];
  }

  // 유료: Free shipping 문구 제거, 배송비만 노출
  return [
    {
      id: "standard",
      label: "Shipping",
      price: autoFee > 0 ? autoFee : DEFAULT_SHIPPING_FEE,
    },
  ];
}

/**
 * 장바구니 주문 요약 (Figma Cart / Order summary)
 * - 배송 라디오(Free shipping 또는 Shipping) + Subtotal / Total + Checkout
 * - 소계 ≥ 5만원: Free shipping
 * - 소계 < 5만원: Shipping(2,500원)
 */
export const CartSummary = ({
  subtotal,
  className,
  style,
  ...props
}: CartSummaryProps) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const shippingOptions = useMemo(
    () => buildShippingOptions(subtotal),
    [subtotal],
  );

  const selected = shippingOptions[0];
  const shippingPrice = selected?.price ?? 0;
  const total = subtotal + shippingPrice;

  return (
    <div
      className={cn("w-full rounded-md border p-4 sm:p-6", className)}
      style={{
        borderColor: commerceColors.border.light,
        backgroundColor: commerceColors.background.paper,
        ...style,
      }}
      {...props}
    >
      <OrderSummaryPanel
        className="max-w-none"
        subtotal={subtotal}
        shippingOptions={shippingOptions}
        selectedShippingId={selected?.id}
        total={total}
        ctaLabel="Checkout"
        checkoutDisabled={subtotal <= 0}
        onCheckout={() => {
          if (!isAuthenticated) {
            router.push(AUTH_URLS.LOGIN);
            return;
          }
          router.push(ACCOUNT_URLS.CHECKOUT);
        }}
      />
    </div>
  );
};
