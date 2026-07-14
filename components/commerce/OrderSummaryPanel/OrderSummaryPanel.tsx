"use client";

import type { HTMLAttributes } from "react";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";
import { Button } from "@/components/ui/Button";
import {
  formatCommercePrice,
  type ShippingOption,
} from "@/components/commerce/types";

export interface OrderSummaryPanelProps
  extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  subtotal: number;
  shippingOptions?: ShippingOption[];
  selectedShippingId?: string;
  onShippingChange?: (id: string) => void;
  total: number;
  ctaLabel?: string;
  onCheckout?: () => void;
  checkoutLoading?: boolean;
  checkoutDisabled?: boolean;
}

export const OrderSummaryPanel = ({
  subtotal,
  shippingOptions = [],
  selectedShippingId,
  onShippingChange,
  total,
  ctaLabel = "Checkout",
  onCheckout,
  checkoutLoading = false,
  checkoutDisabled = false,
  className,
  style,
  ...props
}: OrderSummaryPanelProps) => {
  return (
    <section
      aria-label="주문 요약"
      className={cn("flex w-full max-w-md flex-col gap-6", className)}
      style={{
        fontFamily: commerceTypography.fontFamily.body,
        ...style,
      }}
      {...props}
    >
      {shippingOptions.length > 0 ? (
        <div
          role="radiogroup"
          aria-label="배송 옵션"
          className="flex flex-col gap-3"
        >
          {shippingOptions.map((option) => {
            const selected = option.id === selectedShippingId;
            return (
              <label
                key={option.id}
                className={cn(
                  "flex h-[52px] cursor-pointer items-center justify-between rounded px-4",
                  "focus-within:outline-2 focus-within:outline-offset-2",
                )}
                style={{
                  backgroundColor: commerceColors.background.light,
                  border: selected
                    ? `1px solid ${commerceColors.primary.main}`
                    : "1px solid transparent",
                  outlineColor: commerceColors.primary.main,
                }}
              >
                <span className="inline-flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping-option"
                    value={option.id}
                    checked={selected}
                    className="size-[18px]"
                    style={{ accentColor: commerceColors.primary.main }}
                    onChange={() => onShippingChange?.(option.id)}
                  />
                  <span
                    style={{
                      color: commerceColors.text.secondary,
                      fontSize: commerceTypography.body.md.regular.fontSize,
                      lineHeight: "26px",
                    }}
                  >
                    {option.label}
                  </span>
                </span>
                <span
                  style={{
                    color: commerceColors.text.secondary,
                    fontSize: commerceTypography.body.md.regular.fontSize,
                    lineHeight: "26px",
                  }}
                >
                  {formatCommercePrice(option.price)}
                </span>
              </label>
            );
          })}
        </div>
      ) : null}

      <dl className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <dt
            style={{
              color: commerceColors.text.tertiary,
              fontSize: commerceTypography.body.md.regular.fontSize,
            }}
          >
            Subtotal
          </dt>
          <dd
            style={{
              color: commerceColors.text.secondary,
              fontSize: commerceTypography.body.md.regular.fontSize,
              fontWeight: commerceTypography.fontWeight.semibold,
            }}
          >
            {formatCommercePrice(subtotal)}
          </dd>
        </div>
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: `1px solid ${commerceColors.border.light}` }}
        >
          <dt
            style={{
              color: commerceColors.text.secondary,
              fontSize: "18px",
              fontWeight: commerceTypography.fontWeight.semibold,
            }}
          >
            Total
          </dt>
          <dd
            style={{
              color: commerceColors.text.secondary,
              fontSize: "18px",
              fontWeight: commerceTypography.fontWeight.semibold,
            }}
          >
            {formatCommercePrice(total)}
          </dd>
        </div>
      </dl>

      {onCheckout ? (
        <Button
          variant="solid"
          size="lg"
          className="w-full"
          loading={checkoutLoading}
          disabled={checkoutDisabled}
          onClick={onCheckout}
        >
          {ctaLabel}
        </Button>
      ) : null}
    </section>
  );
};
