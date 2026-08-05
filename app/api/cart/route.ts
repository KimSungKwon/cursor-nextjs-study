import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type CartItemDto = {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  imageUrl: string | null;
  quantity: number;
  status?: "registered" | "hidden" | "sold_out";
};

type CartRow = {
  id: string;
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

type ProductStatus = "registered" | "hidden" | "sold_out";

const CART_SELECT =
  "id, product_id, quantity, products(id, name, price, sale_price, image_url, status)";

function unauthorized() {
  return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
}

function toStatus(value: string): ProductStatus | undefined {
  if (value === "registered" || value === "hidden" || value === "sold_out") {
    return value;
  }
  return undefined;
}

function mapCartRow(row: CartRow): CartItemDto | null {
  const product = Array.isArray(row.products) ? row.products[0] : row.products;
  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    salePrice:
      product.sale_price == null ? null : Number(product.sale_price),
    imageUrl: product.image_url,
    quantity: Number(row.quantity),
    status: toStatus(product.status),
  };
}

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, userId: null as string | null };
  }

  return { supabase, userId: user.id };
}

async function fetchCartItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<CartItemDto[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select(CART_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`장바구니 조회 실패: ${error.message}`);
  }

  return ((data as CartRow[] | null) ?? [])
    .map(mapCartRow)
    .filter((item): item is CartItemDto => item != null);
}

function parseQuantity(value: unknown, fallback = 1): number {
  const quantity = Number(value ?? fallback);
  if (!Number.isFinite(quantity)) {
    return NaN;
  }
  return Math.trunc(quantity);
}

/**
 * GET /api/cart — 현재 사용자 장바구니 조회
 */
export async function GET() {
  const { supabase, userId } = await requireUserId();
  if (!userId) return unauthorized();

  try {
    const items = await fetchCartItems(supabase, userId);
    return NextResponse.json({ items });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "장바구니 조회에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/cart — 상품 추가 (upsert: 기존 수량에 합산)
 */
export async function POST(request: NextRequest) {
  const { supabase, userId } = await requireUserId();
  if (!userId) return unauthorized();

  let body: { productId?: string; quantity?: number };
  try {
    body = (await request.json()) as { productId?: string; quantity?: number };
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const productId = body.productId?.trim();
  const quantity = parseQuantity(body.quantity, 1);

  if (!productId) {
    return NextResponse.json(
      { error: "상품 정보가 올바르지 않습니다." },
      { status: 400 },
    );
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return NextResponse.json(
      { error: "수량은 1 이상이어야 합니다." },
      { status: 400 },
    );
  }

  const { data: existing, error: existingError } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json(
      { error: `장바구니 확인 실패: ${existingError.message}` },
      { status: 500 },
    );
  }

  const existingRow = existing as { id: string; quantity: number } | null;

  if (existingRow) {
    const { error: updateError } = await supabase
      .from("cart_items")
      .update({
        quantity: Number(existingRow.quantity) + quantity,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", existingRow.id)
      .eq("user_id", userId);

    if (updateError) {
      return NextResponse.json(
        { error: `장바구니 수량 합산 실패: ${updateError.message}` },
        { status: 500 },
      );
    }
  } else {
    const { error: insertError } = await supabase.from("cart_items").insert({
      user_id: userId,
      product_id: productId,
      quantity,
    } as never);

    if (insertError) {
      if (insertError.code === "23505") {
        // 레이스: 재조회 후 합산
        const { data: raced } = await supabase
          .from("cart_items")
          .select("id, quantity")
          .eq("user_id", userId)
          .eq("product_id", productId)
          .maybeSingle();

        const racedRow = raced as { id: string; quantity: number } | null;
        if (racedRow) {
          await supabase
            .from("cart_items")
            .update({
              quantity: Number(racedRow.quantity) + quantity,
              updated_at: new Date().toISOString(),
            } as never)
            .eq("id", racedRow.id)
            .eq("user_id", userId);
        }
      } else {
        return NextResponse.json(
          { error: `장바구니 추가 실패: ${insertError.message}` },
          { status: 500 },
        );
      }
    }
  }

  try {
    const items = await fetchCartItems(supabase, userId);
    return NextResponse.json({ items });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "장바구니 조회에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/cart — 수량 변경 (quantity <= 0이면 삭제)
 */
export async function PATCH(request: NextRequest) {
  const { supabase, userId } = await requireUserId();
  if (!userId) return unauthorized();

  let body: { productId?: string; quantity?: number };
  try {
    body = (await request.json()) as { productId?: string; quantity?: number };
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const productId = body.productId?.trim();
  const quantity = parseQuantity(body.quantity, NaN);

  if (!productId) {
    return NextResponse.json(
      { error: "상품 정보가 올바르지 않습니다." },
      { status: 400 },
    );
  }

  if (!Number.isFinite(quantity)) {
    return NextResponse.json(
      { error: "수량이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  if (quantity <= 0) {
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (deleteError) {
      return NextResponse.json(
        { error: `장바구니 삭제 실패: ${deleteError.message}` },
        { status: 500 },
      );
    }
  } else {
    const { data: updated, error: updateError } = await supabase
      .from("cart_items")
      .update({
        quantity,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("user_id", userId)
      .eq("product_id", productId)
      .select("id")
      .maybeSingle();

    if (updateError) {
      return NextResponse.json(
        { error: `장바구니 수량 변경 실패: ${updateError.message}` },
        { status: 500 },
      );
    }

    if (!updated) {
      return NextResponse.json(
        { error: "장바구니 항목을 찾을 수 없습니다." },
        { status: 404 },
      );
    }
  }

  try {
    const items = await fetchCartItems(supabase, userId);
    return NextResponse.json({ items });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "장바구니 조회에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/cart — 상품 제거
 */
export async function DELETE(request: NextRequest) {
  const { supabase, userId } = await requireUserId();
  if (!userId) return unauthorized();

  let productId =
    request.nextUrl.searchParams.get("productId")?.trim() ?? "";

  if (!productId) {
    try {
      const body = (await request.json()) as { productId?: string };
      productId = body.productId?.trim() ?? "";
    } catch {
      // query 또는 body 중 하나 필요
    }
  }

  if (!productId) {
    return NextResponse.json(
      { error: "상품 정보가 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const { error: deleteError } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (deleteError) {
    return NextResponse.json(
      { error: `장바구니 삭제 실패: ${deleteError.message}` },
      { status: 500 },
    );
  }

  try {
    const items = await fetchCartItems(supabase, userId);
    return NextResponse.json({ items });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "장바구니 조회에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
