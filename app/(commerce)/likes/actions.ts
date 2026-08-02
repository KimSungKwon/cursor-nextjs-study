"use server";

import { revalidatePath } from "next/cache";
import { AuthRequiredError } from "@/app/(commerce)/likes/errors";
import { ACCOUNT_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import { createClient } from "@/lib/supabase/server";

async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthRequiredError();
  }

  return user.id;
}

function revalidateLikePaths(productId: string): void {
  revalidatePath(COMMERCE_URLS.HOME);
  revalidatePath(COMMERCE_URLS.PRODUCTS);
  revalidatePath(COMMERCE_URLS.PRODUCT_DETAIL(productId));
  revalidatePath(ACCOUNT_URLS.WISHLIST);
}

/**
 * 현재 사용자가 해당 상품을 찜했는지 조회한다.
 * 비로그인 시 false를 반환한다.
 */
export async function isProductLiked(productId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from("like_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (error) {
    throw new Error(`찜 여부 조회 실패: ${error.message}`);
  }

  return data != null;
}

/**
 * 상품을 찜 목록에 추가한다.
 */
export async function addLikeItem(productId: string): Promise<void> {
  const userId = await requireUserId();
  const supabase = await createClient();

  const { error } = await supabase.from("like_items").insert({
    user_id: userId,
    product_id: productId,
  } as never);

  if (error) {
    // 이미 찜한 경우(unique)는 성공으로 간주
    if (error.code !== "23505") {
      throw new Error(`찜하기 추가 실패: ${error.message}`);
    }
  }

  revalidateLikePaths(productId);
}

/**
 * 상품을 찜 목록에서 제거한다.
 */
export async function removeLikeItem(productId: string): Promise<void> {
  const userId = await requireUserId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("like_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) {
    throw new Error(`찜하기 제거 실패: ${error.message}`);
  }

  revalidateLikePaths(productId);
}

/**
 * 찜 상태를 토글한다.
 */
export async function toggleLikeItem(
  productId: string,
): Promise<{ isLiked: boolean }> {
  const liked = await isProductLiked(productId);

  if (liked) {
    await removeLikeItem(productId);
    return { isLiked: false };
  }

  await addLikeItem(productId);
  return { isLiked: true };
}
