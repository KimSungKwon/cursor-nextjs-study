"use server";

import { revalidatePath } from "next/cache";
import { ACCOUNT_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import {
  getCheckoutCart,
  isPricingEqual,
  type CheckoutPricing,
} from "@/app/(commerce)/checkout/checkout-data";
import { createClient } from "@/lib/supabase/server";

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

export type PlaceOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

type OrderInsertRow = {
  id: string;
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

/**
 * 장바구니 기준 주문을 생성하고 장바구니를 비운다.
 * 서버에서 가격을 재계산해 클라이언트 금액과 다르면 실패한다.
 */
export async function placeOrder(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
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

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        payment_status: "requested",
        total_amount: pricing.total,
        subtotal_amount: pricing.subtotal - pricing.discount,
        shipping_fee: pricing.shipping,
        discount_amount: pricing.discount,
        currency: "KRW",
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
      } as never)
      .select("id")
      .single();

    if (orderError || !order) {
      return {
        ok: false,
        error: `주문 생성 실패: ${orderError?.message ?? "알 수 없는 오류"}`,
      };
    }

    const orderId = (order as OrderInsertRow).id;

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
      // 부분 실패 시 주문 행 정리 시도 (admin만 delete 가능 → pending 상태로 남길 수 있음)
      return {
        ok: false,
        error: `주문 항목 생성 실패: ${itemsError.message}`,
      };
    }

    const { error: clearError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (clearError) {
      // 주문은 생성됐으므로 성공으로 처리하고 장바구니만 경고
      console.error("장바구니 비우기 실패:", clearError.message);
    }

    revalidatePath(COMMERCE_URLS.CART);
    revalidatePath(ACCOUNT_URLS.CHECKOUT);
    revalidatePath(ACCOUNT_URLS.ORDERS);

    return { ok: true, orderId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "주문 처리 중 오류가 발생했습니다.";
    return { ok: false, error: message };
  }
}
