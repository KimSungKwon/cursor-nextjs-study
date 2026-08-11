import {
  isOrderPaymentStatus,
  isOrderStatus,
  isPaymentStatus,
  type OrderDetail,
  type OrderDetailItem,
  type OrderDetailPayment,
} from "@/components/account/orders/types";
import { createClient } from "@/lib/supabase/server";

type OrderRow = {
  id: string;
  user_id: string;
  created_at: string;
  paid_at: string | null;
  status: string;
  payment_status: string;
  currency: string;
  subtotal_amount: number | string;
  shipping_fee: number | string;
  discount_amount: number | string;
  total_amount: number | string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  toss_order_id: string | null;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  shipping_country: string | null;
};

type OrderItemRow = {
  id: string;
  product_id: string;
  product_name: string | null;
  product_image_url: string | null;
  quantity: number | string;
  unit_price: number | string;
  unit_sale_price: number | string | null;
  line_subtotal: number | string;
};

type PaymentRow = {
  id: string;
  provider: string;
  method: string;
  amount: number | string;
  currency: string;
  status: string;
  payment_key: string | null;
  approved_at: string | null;
  created_at: string;
};

function toSafeNumber(value: number | string | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapItem(row: OrderItemRow): OrderDetailItem {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name?.trim() || "Product",
    productImageUrl: row.product_image_url,
    quantity: Math.max(1, Math.trunc(toSafeNumber(row.quantity))),
    unitPrice: toSafeNumber(row.unit_price),
    unitSalePrice:
      row.unit_sale_price == null ? null : toSafeNumber(row.unit_sale_price),
    lineSubtotal: toSafeNumber(row.line_subtotal),
  };
}

function mapPayment(row: PaymentRow): OrderDetailPayment {
  return {
    id: row.id,
    provider: row.provider,
    method: row.method,
    amount: toSafeNumber(row.amount),
    currency: row.currency,
    status: isPaymentStatus(row.status) ? row.status : "pending",
    paymentKey: row.payment_key,
    approvedAt: row.approved_at,
    createdAt: row.created_at,
  };
}

/**
 * 본인 주문의 상세 정보(주문·항목·최근 결제)를 조회한다.
 * 없거나 권한이 없으면 null.
 */
export async function getOrderDetail(
  orderId: string,
  userId: string,
): Promise<OrderDetail | null> {
  const supabase = await createClient();

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select(
      [
        "id",
        "user_id",
        "created_at",
        "paid_at",
        "status",
        "payment_status",
        "currency",
        "subtotal_amount",
        "shipping_fee",
        "discount_amount",
        "total_amount",
        "contact_name",
        "contact_email",
        "contact_phone",
        "toss_order_id",
        "shipping_name",
        "shipping_phone",
        "shipping_address_line1",
        "shipping_address_line2",
        "shipping_city",
        "shipping_state",
        "shipping_zip",
        "shipping_country",
      ].join(", "),
    )
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (orderError) {
    throw new Error(`주문 조회 실패: ${orderError.message}`);
  }

  if (!orderData) {
    return null;
  }

  const order = orderData as OrderRow;

  const [{ data: itemsData, error: itemsError }, { data: paymentData, error: paymentError }] =
    await Promise.all([
      supabase
        .from("order_items")
        .select(
          "id, product_id, product_name, product_image_url, quantity, unit_price, unit_sale_price, line_subtotal",
        )
        .eq("order_id", orderId)
        .order("id", { ascending: true }),
      supabase
        .from("payments")
        .select(
          "id, provider, method, amount, currency, status, payment_key, approved_at, created_at",
        )
        .eq("order_id", orderId)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (itemsError) {
    throw new Error(`주문 상품 조회 실패: ${itemsError.message}`);
  }

  if (paymentError) {
    throw new Error(`결제 정보 조회 실패: ${paymentError.message}`);
  }

  const items = ((itemsData as OrderItemRow[] | null) ?? []).map(mapItem);
  const payment = paymentData
    ? mapPayment(paymentData as PaymentRow)
    : null;

  return {
    id: order.id,
    createdAt: order.created_at,
    paidAt: order.paid_at,
    status: isOrderStatus(order.status) ? order.status : "pending",
    paymentStatus: isOrderPaymentStatus(order.payment_status)
      ? order.payment_status
      : "requested",
    currency: order.currency,
    subtotalAmount: toSafeNumber(order.subtotal_amount),
    shippingFee: toSafeNumber(order.shipping_fee),
    discountAmount: toSafeNumber(order.discount_amount),
    totalAmount: toSafeNumber(order.total_amount),
    contactName: order.contact_name,
    contactEmail: order.contact_email,
    contactPhone: order.contact_phone,
    tossOrderId: order.toss_order_id,
    shipping: {
      name: order.shipping_name,
      phone: order.shipping_phone,
      addressLine1: order.shipping_address_line1,
      addressLine2: order.shipping_address_line2,
      city: order.shipping_city,
      state: order.shipping_state,
      zip: order.shipping_zip,
      country: order.shipping_country,
    },
    items,
    payment,
  };
}
