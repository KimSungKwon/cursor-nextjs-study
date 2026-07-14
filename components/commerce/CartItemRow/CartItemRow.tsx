"use client";

import type { HTMLAttributes } from "react";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";
import { QuantitySelector } from "@/components/commerce/QuantitySelector/QuantitySelector";
import {
  formatCommercePrice,
  type CartItem,
} from "@/components/commerce/types";

export interface CartItemRowItem {
  productId: string;
  name: string;
  imageUrl: string;
  optionLabel?: string;
  unitPrice: number;
  quantity: number;
}

export interface CartItemRowProps
  extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  item: CartItemRowItem | CartItem;
  onQuantityChange?: (productId: string, quantity: number) => void;
  onRemove?: (productId: string) => void;
}

const CloseIcon = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M7 7l10 10M17 7L7 17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

const toRowItem = (item: CartItemRowItem | CartItem): CartItemRowItem => {
  if ("unitPrice" in item) return item;
  return {
    productId: item.productId,
    name: item.name,
    imageUrl: item.imageUrl,
    optionLabel: item.optionLabel,
    unitPrice: item.salePrice ?? item.price,
    quantity: item.quantity,
  };
};

export const CartItemRow = ({
  item,
  onQuantityChange,
  onRemove,
  className,
  style,
  ...props
}: CartItemRowProps) => {
  const row = toRowItem(item);
  const lineTotal = row.unitPrice * row.quantity;

  return (
    <article
      className={cn(
        "flex min-h-36 w-full max-w-[643px] items-center justify-between gap-6 py-6",
        className,
      )}
      style={{
        borderBottom: `1px solid ${commerceColors.border.light}`,
        fontFamily: commerceTypography.fontFamily.body,
        ...style,
      }}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div
          className="h-24 w-20 shrink-0 overflow-hidden"
          style={{ backgroundColor: commerceColors.background.light }}
        >
          {row.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.imageUrl}
              alt={row.name}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <h3
            className="truncate"
            style={{
              color: commerceColors.text.secondary,
              fontSize: commerceTypography.caption.md.semibold.fontSize,
              fontWeight: commerceTypography.fontWeight.semibold,
              lineHeight: "22px",
            }}
          >
            {row.name}
          </h3>
          {row.optionLabel ? (
            <p
              style={{
                color: commerceColors.text.tertiary,
                fontSize: commerceTypography.caption.sm.regular.fontSize,
                fontWeight: commerceTypography.fontWeight.regular,
                lineHeight: "20px",
              }}
            >
              {row.optionLabel}
            </p>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              className={cn(
                "inline-flex w-fit items-center gap-1",
                "focus-visible:outline-2 focus-visible:outline-offset-2",
              )}
              style={{
                color: commerceColors.text.tertiary,
                fontSize: commerceTypography.caption.md.semibold.fontSize,
                fontWeight: commerceTypography.fontWeight.semibold,
                lineHeight: "22px",
                outlineColor: commerceColors.primary.main,
              }}
              onClick={() => onRemove(row.productId)}
            >
              <CloseIcon />
              Remove
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-8">
        <QuantitySelector
          size="sm"
          value={row.quantity}
          min={1}
          onChange={(quantity) =>
            onQuantityChange?.(row.productId, quantity)
          }
        />
        <span
          className="w-16 text-right"
          style={{
            color: commerceColors.text.primary,
            fontSize: "18px",
            fontWeight: commerceTypography.fontWeight.regular,
            lineHeight: "30px",
          }}
        >
          {formatCommercePrice(row.unitPrice)}
        </span>
        <span
          className="w-16 text-right"
          style={{
            color: commerceColors.text.primary,
            fontSize: "18px",
            fontWeight: commerceTypography.fontWeight.semibold,
            lineHeight: "30px",
          }}
        >
          {formatCommercePrice(lineTotal)}
        </span>
      </div>
    </article>
  );
};
