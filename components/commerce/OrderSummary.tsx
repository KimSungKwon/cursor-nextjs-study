"use client";

import type { HTMLAttributes } from "react";
import { FiTag } from "react-icons/fi";
import type {
  CheckoutLineItem,
  CheckoutPricing,
} from "@/app/(commerce)/checkout/checkout-data";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";
import { formatCommercePrice } from "@/components/commerce/types";

export type OrderSummaryProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> & {
  lineItems: CheckoutLineItem[];
  pricing: CheckoutPricing;
};

/**
 * 결제 페이지 우측 주문 요약 (Figma 59:11139 Elements/Checkout/Order Summary)
 */
export const OrderSummary = ({
  lineItems,
  pricing,
  className,
  style,
  ...props
}: OrderSummaryProps) => {
  return (
    <aside
      aria-label="주문 요약"
      className={cn(
        "flex w-full flex-col gap-4 rounded-md border p-4 sm:p-6",
        "lg:sticky lg:top-8",
        className,
      )}
      style={{
        borderColor: commerceColors.border.dark,
        backgroundColor: commerceColors.background.default,
        fontFamily: commerceTypography.fontFamily.body,
        ...style,
      }}
      {...props}
    >
      <h2
        style={{
          color: commerceColors.text.secondary,
          fontFamily: commerceTypography.fontFamily.heading,
          fontSize: commerceTypography.headline.h6.fontSize,
          fontWeight: commerceTypography.fontWeight.medium,
          lineHeight: "34px",
          letterSpacing: "-0.6px",
        }}
      >
        Order summary
      </h2>

      <ul className="flex flex-col">
        {lineItems.map((item) => (
          <li
            key={item.productId}
            className="flex items-start justify-between gap-4 border-b py-6"
            style={{ borderColor: commerceColors.border.light }}
          >
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <div
                className="h-24 w-20 shrink-0 overflow-hidden"
                style={{ backgroundColor: commerceColors.background.light }}
              >
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <p
                  className="truncate"
                  style={{
                    color: commerceColors.text.secondary,
                    fontSize: commerceTypography.caption.md.semibold.fontSize,
                    fontWeight: commerceTypography.fontWeight.semibold,
                    lineHeight: "22px",
                  }}
                >
                  {item.name}
                </p>
                <div
                  className="inline-flex h-8 w-20 items-center justify-center rounded border"
                  style={{
                    borderColor: commerceColors.border.dark,
                    color: commerceColors.text.secondary,
                    fontSize: commerceTypography.caption.sm.semibold.fontSize,
                    fontWeight: commerceTypography.fontWeight.semibold,
                    lineHeight: "20px",
                  }}
                  aria-label={`수량 ${item.quantity}`}
                >
                  {item.quantity}
                </div>
              </div>
            </div>
            <p
              className="shrink-0"
              style={{
                color: commerceColors.text.secondary,
                fontSize: commerceTypography.caption.md.semibold.fontSize,
                fontWeight: commerceTypography.fontWeight.semibold,
                lineHeight: "22px",
              }}
            >
              {formatCommercePrice(item.lineSubtotal)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="flex flex-col">
        {pricing.discount > 0 ? (
          <div
            className="flex items-center justify-between border-b py-[13px]"
            style={{ borderColor: commerceColors.border.light }}
          >
            <dt
              className="inline-flex items-center gap-2"
              style={{
                color: commerceColors.text.secondary,
                fontSize: commerceTypography.body.md.regular.fontSize,
                lineHeight: "26px",
              }}
            >
              <FiTag size={24} aria-hidden />
              Discount
            </dt>
            <dd
              style={{
                color: commerceColors.semantic.success,
                fontSize: commerceTypography.body.md.semibold.fontSize,
                fontWeight: commerceTypography.fontWeight.semibold,
                lineHeight: "26px",
              }}
            >
              -{formatCommercePrice(pricing.discount)}
            </dd>
          </div>
        ) : null}

        <div
          className="flex items-center justify-between border-b py-[13px]"
          style={{ borderColor: commerceColors.border.light }}
        >
          <dt
            style={{
              color: commerceColors.text.secondary,
              fontSize: commerceTypography.body.md.regular.fontSize,
              lineHeight: "26px",
            }}
          >
            Shipping
          </dt>
          <dd
            style={{
              color: commerceColors.text.secondary,
              fontSize: commerceTypography.body.md.semibold.fontSize,
              fontWeight: commerceTypography.fontWeight.semibold,
              lineHeight: "26px",
            }}
          >
            {pricing.shipping === 0
              ? "Free"
              : formatCommercePrice(pricing.shipping)}
          </dd>
        </div>

        <div
          className="flex items-center justify-between border-b py-[13px]"
          style={{ borderColor: commerceColors.border.light }}
        >
          <dt
            style={{
              color: commerceColors.text.secondary,
              fontSize: commerceTypography.body.md.regular.fontSize,
              lineHeight: "26px",
            }}
          >
            Subtotal
          </dt>
          <dd
            style={{
              color: commerceColors.text.secondary,
              fontSize: commerceTypography.body.md.semibold.fontSize,
              fontWeight: commerceTypography.fontWeight.semibold,
              lineHeight: "26px",
            }}
          >
            {formatCommercePrice(pricing.subtotal - pricing.discount)}
          </dd>
        </div>

        <div className="flex items-center justify-between py-[13px]">
          <dt
            style={{
              color: commerceColors.text.secondary,
              fontFamily: commerceTypography.fontFamily.heading,
              fontSize: commerceTypography.headline.h7.fontSize,
              fontWeight: commerceTypography.fontWeight.medium,
              lineHeight: "28px",
            }}
          >
            Total
          </dt>
          <dd
            style={{
              color: commerceColors.text.secondary,
              fontFamily: commerceTypography.fontFamily.heading,
              fontSize: commerceTypography.headline.h7.fontSize,
              fontWeight: commerceTypography.fontWeight.medium,
              lineHeight: "28px",
            }}
          >
            {formatCommercePrice(pricing.total)}
          </dd>
        </div>
      </dl>
    </aside>
  );
};
