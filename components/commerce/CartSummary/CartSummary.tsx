"use client";

import { useRouter } from "next/navigation";
import type { HTMLAttributes } from "react";
import { useAuth } from "@/commons/hooks/useAuth";
import { ACCOUNT_URLS, AUTH_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";
import { OrderSummaryPanel } from "@/components/commerce/OrderSummaryPanel/OrderSummaryPanel";
import type { ShippingOption } from "@/components/commerce/types";

const DEFAULT_SHIPPING: ShippingOption[] = [
  { id: "free", label: "Free shipping", price: 0 },
  { id: "express", label: "Express shipping", price: 15 },
  { id: "pickup", label: "Pick Up", price: 0 },
];

export type CartSummaryProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> & {
  subtotal: number;
  shippingOptions?: ShippingOption[];
  selectedShippingId?: string;
  onShippingChange?: (id: string) => void;
};

/**
 * 장바구니 주문 요약 (OrderSummaryPanel 래퍼)
 */
export const CartSummary = ({
  subtotal,
  shippingOptions = DEFAULT_SHIPPING,
  selectedShippingId = "free",
  onShippingChange,
  className,
  ...props
}: CartSummaryProps) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const selected =
    shippingOptions.find((option) => option.id === selectedShippingId) ??
    shippingOptions[0];
  const shippingPrice = selected?.price ?? 0;
  const total = subtotal + shippingPrice;

  return (
    <OrderSummaryPanel
      className={cn(className)}
      subtotal={subtotal}
      shippingOptions={shippingOptions}
      selectedShippingId={selected?.id}
      onShippingChange={onShippingChange}
      total={total}
      ctaLabel="Checkout"
      onCheckout={() => {
        if (!isAuthenticated) {
          router.push(AUTH_URLS.LOGIN);
          return;
        }
        router.push(ACCOUNT_URLS.CHECKOUT);
      }}
      checkoutDisabled={subtotal <= 0}
      {...props}
    />
  );
};
