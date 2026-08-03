import type { SupabaseClient } from "@supabase/supabase-js";

type LikeProductIdRow = {
  product_id: string;
};

/**
 * 현재 로그인한 사용자가 찜한 productId 집합을 반환한다.
 * 비로그인이거나 조회 실패 시 빈 Set을 반환한다.
 */
export async function getLikedProductIdSet(
  supabase: SupabaseClient,
  productIds: string[],
): Promise<Set<string>> {
  if (productIds.length === 0) {
    return new Set();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Set();
  }

  const { data, error } = await supabase
    .from("like_items")
    .select("product_id")
    .eq("user_id", user.id)
    .in("product_id", productIds);

  if (error || !data) {
    return new Set();
  }

  return new Set(
    (data as LikeProductIdRow[]).map((row) => row.product_id),
  );
}
