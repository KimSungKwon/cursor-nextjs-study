import { calcShippingFee } from "@/commons/store/cart-store";
import { createClient } from "@/lib/supabase/server";

export type CheckoutLineItem = {
  productId: string;
  name: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  unitSalePrice: number | null;
  lineSubtotal: number;
};

export type CheckoutPricing = {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
};

type CartRow = {
  product_id: string;
  quantity: number;
  products:
    | {
        id: string;
        name: string;
        price: number;
        sale_price: number | null;
        image_url: string | null;
        status: string;
      }
    | {
        id: string;
        name: string;
        price: number;
        sale_price: number | null;
        image_url: string | null;
        status: string;
      }[]
    | null;
};

const CART_SELECT =
  "product_id, quantity, products(id, name, price, sale_price, image_url, status)";

function effectiveUnitPrice(
  unitPrice: number,
  unitSalePrice: number | null,
): number {
  if (unitSalePrice != null && unitSalePrice < unitPrice) {
    return unitSalePrice;
  }
  return unitPrice;
}

function buildCheckoutPricing(lineItems: CheckoutLineItem[]): CheckoutPricing {
  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const discount = lineItems.reduce((sum, item) => {
    const effective = effectiveUnitPrice(item.unitPrice, item.unitSalePrice);
    return sum + Math.max(0, item.unitPrice - effective) * item.quantity;
  }, 0);
  const merchandise = Math.max(0, subtotal - discount);
  const shipping = calcShippingFee(merchandise);
  const total = merchandise + shipping;

  return { subtotal, shipping, discount, total };
}

export function isPricingEqual(
  a: CheckoutPricing,
  b: CheckoutPricing,
): boolean {
  return (
    Math.round(a.subtotal) === Math.round(b.subtotal) &&
    Math.round(a.shipping) === Math.round(b.shipping) &&
    Math.round(a.discount) === Math.round(b.discount) &&
    Math.round(a.total) === Math.round(b.total)
  );
}

/**
 * 장바구니 조회 + lineItems/가격 계산 (페이지·주문 액션 공용)
 * hidden 상품 제외
 */
export async function getCheckoutCart(userId: string): Promise<{
  lineItems: CheckoutLineItem[];
  pricing: CheckoutPricing;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cart_items")
    .select(CART_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`장바구니 조회 실패: ${error.message}`);
  }

  const lineItems: CheckoutLineItem[] = [];

  for (const row of (data as CartRow[] | null) ?? []) {
    const product = Array.isArray(row.products)
      ? row.products[0]
      : row.products;
    if (!product) continue;
    if (product.status === "hidden") continue;

    const quantity = Math.trunc(Number(row.quantity));
    if (!Number.isFinite(quantity) || quantity <= 0) continue;

    const unitPrice = Number(product.price);
    const unitSalePrice =
      product.sale_price == null ? null : Number(product.sale_price);
    const lineSubtotal =
      effectiveUnitPrice(unitPrice, unitSalePrice) * quantity;

    lineItems.push({
      productId: product.id,
      name: product.name,
      imageUrl: product.image_url,
      quantity,
      unitPrice,
      unitSalePrice,
      lineSubtotal,
    });
  }

  return {
    lineItems,
    pricing: buildCheckoutPricing(lineItems),
  };
}
