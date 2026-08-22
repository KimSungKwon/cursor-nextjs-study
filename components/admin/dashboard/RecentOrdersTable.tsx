import type { RecentOrder } from "@/app/admin/queries";
import { formatCommercePrice } from "@/components/commerce/types";

export type RecentOrdersTableProps = {
  orders: RecentOrder[];
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  paid: "Completed",
  canceled: "Canceled",
  refunded: "Refunded",
};

function getStatusColor(status: string): string {
  switch (status) {
    case "paid":
      return "var(--admin-semantic-success)";
    case "canceled":
    case "refunded":
      return "var(--admin-semantic-error)";
    case "pending":
    default:
      return "var(--admin-semantic-warning)";
  }
}

/**
 * 최근 주문 테이블
 */
export const RecentOrdersTable = ({ orders }: RecentOrdersTableProps) => {
  return (
    <section
      className="overflow-hidden rounded-2xl"
      style={{ backgroundColor: "var(--admin-background-default)" }}
    >
      <div
        className="border-b px-6 py-4"
        style={{ borderColor: "var(--admin-border-default)" }}
      >
        <h2
          style={{
            fontFamily: "var(--admin-font-family-body)",
            fontSize: "18px",
            fontWeight: 600,
            lineHeight: "26px",
            letterSpacing: "-0.36px",
            color: "var(--admin-text-primary)",
          }}
        >
          Recent Orders
        </h2>
      </div>

      {orders.length === 0 ? (
        <p
          className="px-6 py-10 text-center"
          style={{
            fontFamily: "var(--admin-font-family-body)",
            fontSize: "14px",
            lineHeight: "22px",
            color: "var(--admin-text-muted)",
          }}
        >
          최근 주문이 없습니다.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--admin-background-light)",
                  borderBottom: "1px solid var(--admin-border-default)",
                }}
              >
                {["ID", "Customer", "Status", "Total"].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-6 py-3 text-left"
                    style={{
                      fontFamily: "var(--admin-font-family-body)",
                      fontSize: "13px",
                      fontWeight: 500,
                      lineHeight: "15px",
                      color: "var(--admin-text-muted)",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusColor = getStatusColor(order.status);
                const statusLabel =
                  STATUS_LABEL[order.status] ?? order.status;

                return (
                  <tr
                    key={order.id}
                    style={{ borderBottom: "1px solid var(--admin-border-light)" }}
                  >
                    <td
                      className="px-6 py-3"
                      style={{
                        fontFamily: "var(--admin-font-family-body)",
                        fontSize: "15px",
                        fontWeight: 600,
                        lineHeight: "22px",
                        color: "var(--admin-text-primary)",
                      }}
                    >
                      #{order.id.slice(0, 8)}
                    </td>
                    <td
                      className="px-6 py-3"
                      style={{
                        fontFamily: "var(--admin-font-family-body)",
                        fontSize: "15px",
                        lineHeight: "22px",
                        color: "var(--admin-text-primary)",
                      }}
                    >
                      {order.user_id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-3">
                      <span
                        style={{
                          fontFamily: "var(--admin-font-family-body)",
                          fontSize: "15px",
                          fontWeight: 500,
                          lineHeight: "22px",
                          color: statusColor,
                        }}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    <td
                      className="px-6 py-3"
                      style={{
                        fontFamily: "var(--admin-font-family-body)",
                        fontSize: "15px",
                        fontWeight: 500,
                        lineHeight: "22px",
                        color: "var(--admin-text-primary)",
                      }}
                    >
                      {formatCommercePrice(order.total_amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
