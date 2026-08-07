"use server";

import { revalidatePath } from "next/cache";
import { ACCOUNT_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import {
  buildOrderName,
  createTossOrderId,
  isValidTossPhone,
} from "@/commons/utils/order";
import {
  getCheckoutCart,
  isPricingEqual,
  type CheckoutPricing,
} from "@/app/(commerce)/checkout/checkout-data";
import { createClient } from "@/lib/supabase/server";
import { confirmTossPayment } from "@/lib/toss/confirm";

export type PlaceOrderContact = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

export type PlaceOrderShipping = {
  addressLine1: string;
  country: string;
  city: string;
  state: string;
  zip: string;
};

export type PlaceOrderInput = {
  contact: PlaceOrderContact;
  shipping: PlaceOrderShipping;
  /** 클라이언트가 본 가격 — 서버 재계산과 비교 */
  expectedPricing: CheckoutPricing;
};

export type FindOrCreateOrderInput = PlaceOrderInput & {
  /** sessionStorage 등에 저장된 기존 주문 ID (재시도 시) */
  existingOrderId?: string;
};

export type PlaceOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

export type FindOrCreateOrderResult =
  | {
      ok: true;
      orderId: string;
      tossOrderId: string;
      amount: number;
      orderName: string;
      customerKey: string;
    }
  | { ok: false; error: string };

type OrderRow = {
  id: string;
  toss_order_id: string | null;
  total_amount: number;
  status: string;
  payment_status: string;
};

type PaymentRow = {
  id: string;
  status: string;
};

function trimRequired(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label}을(를) 입력해 주세요.`);
  }
  return trimmed;
}

function validateInput(input: PlaceOrderInput): {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  shipping: PlaceOrderShipping;
} {
  const firstName = trimRequired(input.contact.firstName, "이름");
  const lastName = trimRequired(input.contact.lastName, "성");
  const contactPhone = trimRequired(input.contact.phone, "전화번호");
  const contactEmail = trimRequired(input.contact.email, "이메일");

  if (!isValidTossPhone(contactPhone)) {
    throw new Error("휴대폰 번호는 숫자 10~11자리로 입력해 주세요.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    throw new Error("올바른 이메일 형식이 아닙니다.");
  }

  return {
    contactName: `${firstName} ${lastName}`.trim(),
    contactPhone,
    contactEmail,
    shipping: {
      addressLine1: trimRequired(input.shipping.addressLine1, "도로명 주소"),
      country: trimRequired(input.shipping.country, "국가"),
      city: trimRequired(input.shipping.city, "도시"),
      state: input.shipping.state.trim(),
      zip: trimRequired(input.shipping.zip, "우편번호"),
    },
  };
}

async function ensurePendingPayment(params: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  orderId: string;
  userId: string;
  amount: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: existingPayment, error: paymentSelectError } = await params.supabase
    .from("payments")
    .select("id, status")
    .eq("order_id", params.orderId)
    .eq("user_id", params.userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (paymentSelectError) {
    return {
      ok: false,
      error: `결제 정보 조회 실패: ${paymentSelectError.message}`,
    };
  }

  const payment = existingPayment as PaymentRow | null;
  if (payment?.status === "pending") {
    return { ok: true };
  }

  const { error: paymentInsertError } = await params.supabase
    .from("payments")
    .insert({
      order_id: params.orderId,
      user_id: params.userId,
      provider: "tosspayments",
      method: "card",
      amount: params.amount,
      currency: "KRW",
      status: "pending",
    } as never);

  if (paymentInsertError) {
    return {
      ok: false,
      error: `결제 정보 생성 실패: ${paymentInsertError.message}`,
    };
  }

  return { ok: true };
}

/**
 * pending 주문을 찾거나 생성하고, payments에 pending 행을 보장한다.
 * 결제 완료 전이라 장바구니는 비우지 않는다.
 */
export async function findOrCreateOrder(
  input: FindOrCreateOrderInput,
): Promise<FindOrCreateOrderResult> {
  try {
    const validated = validateInput(input);
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { ok: false, error: "로그인이 필요합니다." };
    }

    const { lineItems, pricing } = await getCheckoutCart(user.id);

    if (lineItems.length === 0) {
      return { ok: false, error: "장바구니가 비어 있습니다." };
    }

    if (!isPricingEqual(pricing, input.expectedPricing)) {
      return {
        ok: false,
        error:
          "주문 금액이 변경되었습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.",
      };
    }

    const amount = Math.round(pricing.total);
    const orderName = buildOrderName(lineItems.map((item) => item.name));
    const shippingFields = {
      contact_name: validated.contactName,
      contact_phone: validated.contactPhone,
      contact_email: validated.contactEmail,
      shipping_name: validated.contactName,
      shipping_phone: validated.contactPhone,
      shipping_address_line1: validated.shipping.addressLine1,
      shipping_city: validated.shipping.city,
      shipping_state: validated.shipping.state || null,
      shipping_zip: validated.shipping.zip,
      shipping_country: validated.shipping.country,
    };

    // 1) 기존 pending 주문 재사용 시도
    if (input.existingOrderId) {
      const { data: existing, error: existingError } = await supabase
        .from("orders")
        .select("id, toss_order_id, total_amount, status, payment_status")
        .eq("id", input.existingOrderId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingError) {
        return {
          ok: false,
          error: `기존 주문 조회 실패: ${existingError.message}`,
        };
      }

      const existingOrder = existing as OrderRow | null;
      if (
        existingOrder &&
        existingOrder.status === "pending" &&
        existingOrder.payment_status === "requested" &&
        Math.round(Number(existingOrder.total_amount)) === amount
      ) {
        let tossOrderId = existingOrder.toss_order_id;
        if (!tossOrderId) {
          tossOrderId = createTossOrderId();
          const { error: tossIdError } = await supabase
            .from("orders")
            .update({ toss_order_id: tossOrderId, ...shippingFields } as never)
            .eq("id", existingOrder.id)
            .eq("user_id", user.id);

          if (tossIdError) {
            return {
              ok: false,
              error: `주문번호 저장 실패: ${tossIdError.message}`,
            };
          }
        } else {
          const { error: updateError } = await supabase
            .from("orders")
            .update(shippingFields as never)
            .eq("id", existingOrder.id)
            .eq("user_id", user.id);

          if (updateError) {
            return {
              ok: false,
              error: `주문 정보 갱신 실패: ${updateError.message}`,
            };
          }
        }

        const paymentResult = await ensurePendingPayment({
          supabase,
          orderId: existingOrder.id,
          userId: user.id,
          amount,
        });
        if (!paymentResult.ok) return paymentResult;

        return {
          ok: true,
          orderId: existingOrder.id,
          tossOrderId,
          amount,
          orderName,
          customerKey: user.id,
        };
      }
    }

    // 2) 새 주문 + pending 결제 생성
    const tossOrderId = createTossOrderId();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        payment_status: "requested",
        total_amount: amount,
        subtotal_amount: Math.round(pricing.subtotal - pricing.discount),
        shipping_fee: Math.round(pricing.shipping),
        discount_amount: Math.round(pricing.discount),
        currency: "KRW",
        toss_order_id: tossOrderId,
        ...shippingFields,
      } as never)
      .select("id")
      .single();

    if (orderError || !order) {
      return {
        ok: false,
        error: `주문 생성 실패: ${orderError?.message ?? "알 수 없는 오류"}`,
      };
    }

    const orderId = (order as { id: string }).id;

    const orderItems = lineItems.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      unit_sale_price: item.unitSalePrice,
      product_name: item.name,
      product_image_url: item.imageUrl,
      line_subtotal: item.lineSubtotal,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems as never);

    if (itemsError) {
      return {
        ok: false,
        error: `주문 항목 생성 실패: ${itemsError.message}`,
      };
    }

    const paymentResult = await ensurePendingPayment({
      supabase,
      orderId,
      userId: user.id,
      amount,
    });
    if (!paymentResult.ok) return paymentResult;

    revalidatePath(ACCOUNT_URLS.ORDERS);

    return {
      ok: true,
      orderId,
      tossOrderId,
      amount,
      orderName,
      customerKey: user.id,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "주문 처리 중 오류가 발생했습니다.";
    return { ok: false, error: message };
  }
}

/**
 * 장바구니 기준 주문을 생성하고 장바구니를 비운다.
 * (결제창 연동 이전 플로우 — findOrCreateOrder 사용 권장)
 */
export async function placeOrder(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  try {
    const result = await findOrCreateOrder(input);
    if (!result.ok) return result;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { error: clearError } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (clearError) {
        console.error("장바구니 비우기 실패:", clearError.message);
      }
    }

    revalidatePath(COMMERCE_URLS.CART);
    revalidatePath(ACCOUNT_URLS.CHECKOUT);
    revalidatePath(ACCOUNT_URLS.ORDERS);

    return { ok: true, orderId: result.orderId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "주문 처리 중 오류가 발생했습니다.";
    return { ok: false, error: message };
  }
}

export type CompletePaymentInput = {
  /** 토스 orderId (= orders.toss_order_id) */
  tossOrderId: string;
  paymentKey: string;
  /** successUrl 쿼리 amount (검증용) */
  amountFromQuery: number;
};

export type CompletePaymentResult =
  | {
      ok: true;
      orderId: string;
      tossOrderId: string;
      paymentKey: string;
      amount: number;
      alreadyCompleted?: boolean;
    }
  | { ok: false; error: string; code?: string };

export type FailPaymentInput = {
  tossOrderId?: string;
  /** 내부 orders.id (취소 등으로 toss orderId가 없을 때) */
  dbOrderId?: string;
  code?: string;
  message?: string;
};

export type FailPaymentResult =
  | {
      ok: true;
      orderId: string;
      tossOrderId: string | null;
      skipped?: boolean;
    }
  | { ok: false; error: string };

type OrderForPayment = {
  id: string;
  user_id: string;
  toss_order_id: string | null;
  total_amount: number;
  status: string;
  payment_status: string;
};

/**
 * 결제 인증 성공 후: 금액 검증 → 토스 승인 → orders/payments 성공 상태 반영
 */
export async function completeCheckoutPayment(
  input: CompletePaymentInput,
): Promise<CompletePaymentResult> {
  try {
    if (!input.paymentKey || !input.tossOrderId) {
      return { ok: false, error: "결제 정보가 올바르지 않습니다." };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { ok: false, error: "로그인이 필요합니다." };
    }

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, toss_order_id, total_amount, status, payment_status")
      .eq("toss_order_id", input.tossOrderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (orderError || !orderData) {
      return {
        ok: false,
        error: `주문을 찾을 수 없습니다: ${orderError?.message ?? "not found"}`,
      };
    }

    const order = orderData as OrderForPayment;
    const storedAmount = Math.round(Number(order.total_amount));

    if (
      order.status === "paid" &&
      order.payment_status === "success"
    ) {
      return {
        ok: true,
        orderId: order.id,
        tossOrderId: input.tossOrderId,
        paymentKey: input.paymentKey,
        amount: storedAmount,
        alreadyCompleted: true,
      };
    }

    if (storedAmount !== Math.round(input.amountFromQuery)) {
      return {
        ok: false,
        error: "결제 금액이 주문 금액과 일치하지 않습니다.",
        code: "AMOUNT_MISMATCH",
      };
    }

    const confirmResult = await confirmTossPayment({
      paymentKey: input.paymentKey,
      orderId: input.tossOrderId,
      amount: storedAmount,
    });

    if (!confirmResult.ok) {
      await supabase
        .from("payments")
        .update({
          status: "failed",
          payment_key: input.paymentKey,
          raw_payload: {
            code: confirmResult.code,
            message: confirmResult.message,
          },
        } as never)
        .eq("order_id", order.id)
        .eq("user_id", user.id)
        .eq("status", "pending");

      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
        } as never)
        .eq("id", order.id)
        .eq("user_id", user.id);

      return {
        ok: false,
        error: confirmResult.message,
        code: confirmResult.code,
      };
    }

    const paidAt = new Date().toISOString();

    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_status: "success",
        paid_at: paidAt,
      } as never)
      .eq("id", order.id)
      .eq("user_id", user.id);

    if (orderUpdateError) {
      return {
        ok: false,
        error: `주문 상태 갱신 실패: ${orderUpdateError.message}`,
      };
    }

    const { error: paymentUpdateError } = await supabase
      .from("payments")
      .update({
        status: "succeeded",
        payment_key: input.paymentKey,
        approved_at: paidAt,
        raw_payload: confirmResult.payment,
      } as never)
      .eq("order_id", order.id)
      .eq("user_id", user.id)
      .eq("status", "pending");

    if (paymentUpdateError) {
      return {
        ok: false,
        error: `결제 상태 갱신 실패: ${paymentUpdateError.message}`,
      };
    }

    const { error: clearError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (clearError) {
      console.error("장바구니 비우기 실패:", clearError.message);
    }

    // 페이지 렌더 중 호출되므로 revalidatePath 사용 금지

    return {
      ok: true,
      orderId: order.id,
      tossOrderId: input.tossOrderId,
      paymentKey: input.paymentKey,
      amount: storedAmount,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "결제 완료 처리 중 오류가 발생했습니다.";
    return { ok: false, error: message };
  }
}

/**
 * 결제 인증 실패/취소 시: orders/payments를 failed로 갱신
 */
export async function failCheckoutPayment(
  input: FailPaymentInput,
): Promise<FailPaymentResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { ok: false, error: "로그인이 필요합니다." };
    }

    let orderQuery = supabase
      .from("orders")
      .select("id, user_id, toss_order_id, total_amount, status, payment_status")
      .eq("user_id", user.id);

    if (input.tossOrderId) {
      orderQuery = orderQuery.eq("toss_order_id", input.tossOrderId);
    } else if (input.dbOrderId) {
      orderQuery = orderQuery.eq("id", input.dbOrderId);
    } else {
      return {
        ok: false,
        error: "주문 식별자가 없어 실패 상태를 저장하지 못했습니다.",
      };
    }

    const { data: orderData, error: orderError } = await orderQuery.maybeSingle();

    if (orderError || !orderData) {
      return {
        ok: false,
        error: `주문을 찾을 수 없습니다: ${orderError?.message ?? "not found"}`,
      };
    }

    const order = orderData as OrderForPayment;

    // 이미 결제 완료된 주문은 덮어쓰지 않음
    if (order.status === "paid" || order.payment_status === "success") {
      return {
        ok: true,
        orderId: order.id,
        tossOrderId: order.toss_order_id,
        skipped: true,
      };
    }

    const rawPayload = {
      code: input.code ?? null,
      message: input.message ?? null,
    };

    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        payment_status: "failed",
      } as never)
      .eq("id", order.id)
      .eq("user_id", user.id);

    if (orderUpdateError) {
      return {
        ok: false,
        error: `주문 상태 갱신 실패: ${orderUpdateError.message}`,
      };
    }

    const { error: paymentUpdateError } = await supabase
      .from("payments")
      .update({
        status: "failed",
        raw_payload: rawPayload,
      } as never)
      .eq("order_id", order.id)
      .eq("user_id", user.id)
      .eq("status", "pending");

    if (paymentUpdateError) {
      return {
        ok: false,
        error: `결제 상태 갱신 실패: ${paymentUpdateError.message}`,
      };
    }

    // 페이지 렌더 중 호출되므로 revalidatePath 사용 금지

    return {
      ok: true,
      orderId: order.id,
      tossOrderId: order.toss_order_id,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "결제 실패 처리 중 오류가 발생했습니다.";
    return { ok: false, error: message };
  }
}
