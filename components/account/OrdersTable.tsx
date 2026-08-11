import Link from "next/link";
import { AccountPagination } from "@/components/account/AccountPagination/AccountPagination";
import { OrderEmptyState } from "@/components/account/OrderEmptyState";
import {
  formatOrderCode,
  formatOrderDate,
  formatOrderStatusLabel,
  type AccountOrder,
  type OrderStatus,
} from "@/components/account/orders/types";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";
import { formatCommercePrice } from "@/components/commerce/types";

export type OrdersTableProps = {
  items: AccountOrder[];
  totalCount: number;
  page: number;
  totalPages: number;
  className?: string;
};

const statusColor: Record<OrderStatus, string> = {
  paid: commerceColors.semantic.success,
  pending: commerceColors.semantic.warning,
  canceled: commerceColors.semantic.error,
  refunded: commerceColors.text.tertiary,
};

/**
 * 주문 내역 테이블 (Order ID / Date / Status / Price)
 * 행 클릭 시 주문 상세로 이동 (상세 페이지는 별도)
 */
export const OrdersTable = ({
  items,
  totalCount,
  page,
  totalPages,
  className,
}: OrdersTableProps) => {
  const headerStyle = {
    fontFamily: commerceTypography.fontFamily.body,
    fontSize: commerceTypography.caption.md.regular.fontSize,
    fontWeight: commerceTypography.fontWeight.regular,
    lineHeight: "22px",
    color: commerceColors.text.tertiary,
  } as const;

  const cellStyle = {
    fontFamily: commerceTypography.fontFamily.body,
    fontSize: commerceTypography.caption.md.regular.fontSize,
    fontWeight: commerceTypography.fontWeight.regular,
    lineHeight: "22px",
    color: commerceColors.text.secondary,
  } as const;

  return (
    <section className={cn("flex w-full max-w-[707px] flex-col", className)}>
      <h2
        className="mb-10"
        style={{
          fontFamily: commerceTypography.fontFamily.body,
          fontSize: commerceTypography.body.lg.semibold.fontSize,
          fontWeight: commerceTypography.fontWeight.semibold,
          lineHeight: "32px",
          color: commerceColors.text.primary,
        }}
      >
        Orders History
      </h2>

      {totalCount === 0 ? (
        <OrderEmptyState />
      ) : (
        <div className="flex flex-col gap-10">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr
                  className="border-b"
                  style={{ borderColor: commerceColors.border.light }}
                >
                  <th className="pb-2 pr-4 font-normal" style={headerStyle}>
                    Number ID
                  </th>
                  <th className="pb-2 pr-4 font-normal" style={headerStyle}>
                    Dates
                  </th>
                  <th className="pb-2 pr-4 font-normal" style={headerStyle}>
                    Status
                  </th>
                  <th className="pb-2 font-normal" style={headerStyle}>
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((order) => {
                  const href = ACCOUNT_URLS.ORDER_DETAIL(order.id);
                  const statusLabel = formatOrderStatusLabel(order.status);

                  return (
                    <tr
                      key={order.id}
                      className="border-b transition-colors hover:bg-[var(--commerce-background-light)]"
                      style={{ borderColor: commerceColors.border.light }}
                    >
                      <td className="py-6 pr-4 align-middle">
                        <Link
                          href={href}
                          className="block transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
                          style={{
                            ...cellStyle,
                            outlineColor: commerceColors.primary.main,
                          }}
                        >
                          {formatOrderCode(order.id)}
                        </Link>
                      </td>
                      <td className="py-6 pr-4 align-middle">
                        <Link
                          href={href}
                          className="block focus-visible:outline-2 focus-visible:outline-offset-2"
                          style={{
                            ...cellStyle,
                            outlineColor: commerceColors.primary.main,
                          }}
                        >
                          {formatOrderDate(order.createdAt)}
                        </Link>
                      </td>
                      <td className="py-6 pr-4 align-middle">
                        <Link
                          href={href}
                          className="inline-block focus-visible:outline-2 focus-visible:outline-offset-2"
                          style={{
                            fontFamily: commerceTypography.fontFamily.body,
                            fontSize:
                              commerceTypography.caption.md.regular.fontSize,
                            fontWeight: commerceTypography.fontWeight.regular,
                            lineHeight: "22px",
                            color: statusColor[order.status],
                            outlineColor: commerceColors.primary.main,
                          }}
                          aria-label={`주문 상태 ${statusLabel}`}
                        >
                          {statusLabel}
                        </Link>
                      </td>
                      <td className="py-6 align-middle">
                        <Link
                          href={href}
                          className="block focus-visible:outline-2 focus-visible:outline-offset-2"
                          style={{
                            ...cellStyle,
                            outlineColor: commerceColors.primary.main,
                          }}
                        >
                          {formatCommercePrice(order.totalAmount)}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <AccountPagination
            page={page}
            totalPages={totalPages}
            basePath={ACCOUNT_URLS.ORDERS}
            aria-label="주문 내역 페이지네이션"
          />
        </div>
      )}
    </section>
  );
};
