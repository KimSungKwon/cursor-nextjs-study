import Link from "next/link";
import type { ReactNode } from "react";
import { OrderStatusBadge } from "@/components/account/orders/OrderStatusBadge";
import { PaymentStatusBadge } from "@/components/account/orders/PaymentStatusBadge";
import {
  formatOrderCode,
  formatOrderDate,
  formatPaymentMethodLabel,
  formatPaymentProviderLabel,
  type OrderDetail,
} from "@/components/account/orders/types";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";
import { formatCommercePrice } from "@/components/commerce/types";

export type OrderDetailViewProps = {
  order: OrderDetail;
  className?: string;
};

const sectionTitleStyle = {
  fontFamily: commerceTypography.fontFamily.body,
  fontSize: commerceTypography.body.lg.semibold.fontSize,
  fontWeight: commerceTypography.fontWeight.semibold,
  lineHeight: "32px",
  color: commerceColors.text.primary,
} as const;

const labelStyle = {
  fontFamily: commerceTypography.fontFamily.body,
  fontSize: commerceTypography.caption.md.regular.fontSize,
  fontWeight: commerceTypography.fontWeight.regular,
  lineHeight: "22px",
  color: commerceColors.text.tertiary,
} as const;

const valueStyle = {
  fontFamily: commerceTypography.fontFamily.body,
  fontSize: commerceTypography.caption.md.regular.fontSize,
  fontWeight: commerceTypography.fontWeight.regular,
  lineHeight: "22px",
  color: commerceColors.text.secondary,
} as const;

function SectionCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-6 rounded-lg border p-4 sm:p-6",
        className,
      )}
      style={{
        borderColor: commerceColors.border.light,
        backgroundColor: commerceColors.background.default,
      }}
    >
      <h3 style={sectionTitleStyle}>{title}</h3>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <dt style={labelStyle}>{label}</dt>
      <dd className="sm:text-right" style={valueStyle}>
        {value}
      </dd>
    </div>
  );
}

function formatAddress(order: OrderDetail): string {
  const { shipping } = order;
  const parts = [
    shipping.addressLine1,
    shipping.addressLine2,
    [shipping.city, shipping.state].filter(Boolean).join(", "),
    shipping.zip,
    shipping.country,
  ].filter((part) => part && part.trim().length > 0);

  return parts.length > 0 ? parts.join(" · ") : "-";
}

/**
 * 주문 상세 본문 (Breadcrumb + Header + Summary + Products + Shipping + Payment)
 */
export const OrderDetailView = ({ order, className }: OrderDetailViewProps) => {
  const orderCode = formatOrderCode(order.id);

  return (
    <div className={cn("flex w-full max-w-[707px] flex-col gap-8", className)}>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2">
        <Link
          href={ACCOUNT_URLS.ACCOUNT}
          className="transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            ...labelStyle,
            outlineColor: commerceColors.primary.main,
          }}
        >
          My Account
        </Link>
        <span aria-hidden style={labelStyle}>
          /
        </span>
        <Link
          href={ACCOUNT_URLS.ORDERS}
          className="transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            ...labelStyle,
            outlineColor: commerceColors.primary.main,
          }}
        >
          Orders
        </Link>
        <span aria-hidden style={labelStyle}>
          /
        </span>
        <span
          aria-current="page"
          style={{
            ...labelStyle,
            color: commerceColors.text.secondary,
            fontWeight: commerceTypography.fontWeight.semibold,
          }}
        >
          {orderCode}
        </span>
      </nav>

      <header className="flex flex-col gap-3 border-b pb-6" style={{ borderColor: commerceColors.border.light }}>
        <div className="flex flex-wrap items-center gap-3">
          <h2 style={sectionTitleStyle}>Order {orderCode}</h2>
          <OrderStatusBadge status={order.status} />
        </div>
        <p style={labelStyle}>
          Placed on {formatOrderDate(order.createdAt)}
          {order.paidAt ? ` · Paid on ${formatOrderDate(order.paidAt)}` : ""}
        </p>
      </header>

      <SectionCard title="Order Summary">
        <dl className="flex flex-col gap-4">
          <InfoRow
            label="Items total"
            value={formatCommercePrice(order.subtotalAmount)}
          />
          <InfoRow
            label="Shipping"
            value={
              order.shippingFee === 0
                ? "Free"
                : formatCommercePrice(order.shippingFee)
            }
          />
          <InfoRow
            label="Discount"
            value={
              order.discountAmount > 0
                ? `-${formatCommercePrice(order.discountAmount)}`
                : formatCommercePrice(0)
            }
          />
          <div
            className="flex items-center justify-between border-t pt-4"
            style={{ borderColor: commerceColors.border.light }}
          >
            <dt
              style={{
                ...valueStyle,
                fontWeight: commerceTypography.fontWeight.semibold,
              }}
            >
              Total
            </dt>
            <dd
              style={{
                ...valueStyle,
                fontWeight: commerceTypography.fontWeight.semibold,
              }}
            >
              {formatCommercePrice(order.totalAmount)}
            </dd>
          </div>
        </dl>
      </SectionCard>

      <SectionCard title="Products in this order">
        {order.items.length === 0 ? (
          <p style={labelStyle}>주문 상품이 없습니다.</p>
        ) : (
          <ul className="flex flex-col">
            {order.items.map((item) => {
              const unit =
                item.unitSalePrice != null && item.unitSalePrice < item.unitPrice
                  ? item.unitSalePrice
                  : item.unitPrice;

              return (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-4 border-b py-5 last:border-b-0 last:pb-0 first:pt-0"
                  style={{ borderColor: commerceColors.border.light }}
                >
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <Link
                      href={COMMERCE_URLS.PRODUCT_DETAIL(item.productId)}
                      className="size-20 shrink-0 overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 sm:h-24 sm:w-20"
                      style={{
                        backgroundColor: commerceColors.background.light,
                        outlineColor: commerceColors.primary.main,
                      }}
                    >
                      {item.productImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.productImageUrl}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="sr-only">{item.productName}</span>
                      )}
                    </Link>
                    <div className="flex min-w-0 flex-col gap-1">
                      <Link
                        href={COMMERCE_URLS.PRODUCT_DETAIL(item.productId)}
                        className="line-clamp-2 transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={{
                          ...valueStyle,
                          outlineColor: commerceColors.primary.main,
                        }}
                      >
                        {item.productName}
                      </Link>
                      <p style={labelStyle}>
                        Qty: {item.quantity} · {formatCommercePrice(unit)}
                      </p>
                    </div>
                  </div>
                  <p
                    className="shrink-0"
                    style={{
                      ...valueStyle,
                      fontWeight: commerceTypography.fontWeight.semibold,
                    }}
                  >
                    {formatCommercePrice(item.lineSubtotal)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Shipping Information">
        <dl className="flex flex-col gap-4">
          <InfoRow label="Recipient" value={order.shipping.name ?? "-"} />
          <InfoRow label="Phone" value={order.shipping.phone ?? "-"} />
          <InfoRow label="Address" value={formatAddress(order)} />
        </dl>
      </SectionCard>

      <SectionCard title="Payment Information">
        {order.payment ? (
          <dl className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <dt style={labelStyle}>Status</dt>
              <dd className="sm:text-right">
                <PaymentStatusBadge status={order.payment.status} />
              </dd>
            </div>
            <InfoRow
              label="Provider"
              value={formatPaymentProviderLabel(order.payment.provider)}
            />
            <InfoRow
              label="Method"
              value={formatPaymentMethodLabel(order.payment.method)}
            />
            <InfoRow
              label="Amount"
              value={formatCommercePrice(order.payment.amount)}
            />
            <InfoRow
              label="Paid at"
              value={
                order.payment.approvedAt
                  ? formatOrderDate(order.payment.approvedAt)
                  : "-"
              }
            />
          </dl>
        ) : (
          <p style={labelStyle}>결제 정보가 없습니다.</p>
        )}
      </SectionCard>
    </div>
  );
};
