export const ORDERS_PAGE_SIZE = 5;

export type OrderStatus = "pending" | "paid" | "canceled" | "refunded";

export type AccountOrder = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  totalAmount: number;
};

export type OrdersListResult = {
  items: AccountOrder[];
  totalCount: number;
  page: number;
  totalPages: number;
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (
    value === "pending" ||
    value === "paid" ||
    value === "canceled" ||
    value === "refunded"
  );
}

export function formatOrderCode(orderId: string): string {
  const compact = orderId.replace(/-/g, "").slice(0, 10);
  return `#${compact.slice(0, 4)}_${compact.slice(4)}`;
}

export function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatOrderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "paid":
      return "Completed";
    case "pending":
      return "Process";
    case "canceled":
      return "Canceled";
    case "refunded":
      return "Refunded";
    default:
      return status;
  }
}
