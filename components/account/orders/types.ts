export const ORDERS_PAGE_SIZE = 5;

export type OrderStatus = "pending" | "paid" | "canceled" | "refunded";

export type PaymentStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "cancelled";

export type OrderPaymentStatus =
  | "requested"
  | "success"
  | "failed"
  | "refund_requested"
  | "refund_completed";

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

export type OrderDetailItem = {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string | null;
  quantity: number;
  unitPrice: number;
  unitSalePrice: number | null;
  lineSubtotal: number;
};

export type OrderDetailPayment = {
  id: string;
  provider: string;
  method: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentKey: string | null;
  approvedAt: string | null;
  createdAt: string;
};

export type OrderDetailShipping = {
  name: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
};

export type OrderDetail = {
  id: string;
  createdAt: string;
  paidAt: string | null;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  currency: string;
  subtotalAmount: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  tossOrderId: string | null;
  shipping: OrderDetailShipping;
  items: OrderDetailItem[];
  payment: OrderDetailPayment | null;
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (
    value === "pending" ||
    value === "paid" ||
    value === "canceled" ||
    value === "refunded"
  );
}

export function isPaymentStatus(value: string): value is PaymentStatus {
  return (
    value === "pending" ||
    value === "succeeded" ||
    value === "failed" ||
    value === "cancelled"
  );
}

export function isOrderPaymentStatus(
  value: string,
): value is OrderPaymentStatus {
  return (
    value === "requested" ||
    value === "success" ||
    value === "failed" ||
    value === "refund_requested" ||
    value === "refund_completed"
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

export function formatPaymentStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case "succeeded":
      return "Paid";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

export function formatPaymentMethodLabel(method: string): string {
  switch (method.toLowerCase()) {
    case "card":
      return "Credit Card";
    case "transfer":
      return "Bank Transfer";
    case "virtual_account":
      return "Virtual Account";
    default:
      return method;
  }
}

export function formatPaymentProviderLabel(provider: string): string {
  switch (provider.toLowerCase()) {
    case "tosspayments":
      return "Toss Payments";
    case "mock":
      return "Mock";
    default:
      return provider;
  }
}
