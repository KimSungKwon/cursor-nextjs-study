import { createClient } from "@/lib/supabase/server";

export type BestSellingProduct = {
  product_id: string;
  product_name: string;
  image_url: string | null;
  total_quantity: number;
};

export type TrendingProduct = {
  product_id: string;
  product_name: string;
  image_url: string | null;
  like_count: number;
};

export type RecentOrder = {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
};

type OrderItemRow = {
  product_id: string;
  quantity: number | string;
  products: {
    id: string;
    name: string;
    image_url: string | null;
  } | {
    id: string;
    name: string;
    image_url: string | null;
  }[] | null;
};

type LikeItemRow = {
  product_id: string;
  products: {
    id: string;
    name: string;
    image_url: string | null;
  } | {
    id: string;
    name: string;
    image_url: string | null;
  }[] | null;
};

type OrderRow = {
  id: string;
  user_id: string;
  status: string;
  total_amount: number | string;
  created_at: string;
};

function normalizeJoin<T>(value: T | T[] | null): T | null {
  if (!value) {
    return null;
  }
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function toNumber(value: number | string | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getTodayRange(): { start: string; end: string } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

/**
 * 오늘 생성된 주문 건수를 조회한다.
 */
export async function getTodayOrderCount(): Promise<number> {
  const supabase = await createClient();
  const { start, end } = getTodayRange();

  const { count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .gte("created_at", start)
    .lt("created_at", end);

  if (error) {
    throw new Error(`오늘 주문 수 조회 실패: ${error.message}`);
  }

  return count ?? 0;
}

/**
 * order_items 기준 판매량 상위 상품을 조회한다.
 */
export async function getBestSellingProducts(
  limit: number,
): Promise<BestSellingProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_items")
    .select("product_id, quantity, products(id, name, image_url)");

  if (error) {
    throw new Error(`베스트셀러 조회 실패: ${error.message}`);
  }

  const totals = new Map<
    string,
    { product_name: string; image_url: string | null; total_quantity: number }
  >();

  for (const row of (data as OrderItemRow[] | null) ?? []) {
    const product = normalizeJoin(row.products);
    if (!product?.name) {
      continue;
    }

    const current = totals.get(row.product_id);
    const quantity = toNumber(row.quantity);
    if (current) {
      current.total_quantity += quantity;
      continue;
    }

    totals.set(row.product_id, {
      product_name: product.name,
      image_url: product.image_url,
      total_quantity: quantity,
    });
  }

  return [...totals.entries()]
    .map(([product_id, item]) => ({
      product_id,
      product_name: item.product_name,
      image_url: item.image_url,
      total_quantity: item.total_quantity,
    }))
    .sort((a, b) => b.total_quantity - a.total_quantity)
    .slice(0, limit);
}

/**
 * like_items 기준 좋아요 상위 상품을 조회한다.
 */
export async function getTrendingProducts(
  limit: number,
): Promise<TrendingProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("like_items")
    .select("product_id, products(id, name, image_url)");

  if (error) {
    throw new Error(`트렌딩 상품 조회 실패: ${error.message}`);
  }

  const totals = new Map<
    string,
    { product_name: string; image_url: string | null; like_count: number }
  >();

  for (const row of (data as LikeItemRow[] | null) ?? []) {
    const product = normalizeJoin(row.products);
    if (!product?.name) {
      continue;
    }

    const current = totals.get(row.product_id);
    if (current) {
      current.like_count += 1;
      continue;
    }

    totals.set(row.product_id, {
      product_name: product.name,
      image_url: product.image_url,
      like_count: 1,
    });
  }

  return [...totals.entries()]
    .map(([product_id, item]) => ({
      product_id,
      product_name: item.product_name,
      image_url: item.image_url,
      like_count: item.like_count,
    }))
    .sort((a, b) => b.like_count - a.like_count)
    .slice(0, limit);
}

/**
 * 최근 주문 목록을 조회한다.
 */
export async function getRecentOrders(limit: number): Promise<RecentOrder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, user_id, status, total_amount, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`최근 주문 조회 실패: ${error.message}`);
  }

  return ((data as OrderRow[] | null) ?? []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    status: row.status,
    total_amount: toNumber(row.total_amount),
    created_at: row.created_at,
  }));
}
