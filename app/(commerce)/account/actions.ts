"use server";

import { revalidatePath } from "next/cache";
import { ACCOUNT_URLS } from "@/commons/constants/url";
import { createClient } from "@/lib/supabase/server";

export type UpdateProfileImageResult =
  | { ok: true; imageUrl: string }
  | { ok: false; error: string };

const MAX_DATA_URL_LENGTH = 1_500_000; // ~1.5MB data URL

/**
 * 로그인 사용자의 프로필 이미지를 data URL로 저장한다.
 */
export async function updateProfileImage(
  imageDataUrl: string,
): Promise<UpdateProfileImageResult> {
  try {
    const trimmed = imageDataUrl.trim();

    if (!trimmed.startsWith("data:image/")) {
      return { ok: false, error: "이미지 파일만 업로드할 수 있습니다." };
    }

    if (trimmed.length > MAX_DATA_URL_LENGTH) {
      return {
        ok: false,
        error: "이미지 용량이 너무 큽니다. 더 작은 이미지를 선택해 주세요.",
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { ok: false, error: "로그인이 필요합니다." };
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        image_url: trimmed,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", user.id);

    if (updateError) {
      return {
        ok: false,
        error: `프로필 이미지 저장 실패: ${updateError.message}`,
      };
    }

    revalidatePath(ACCOUNT_URLS.ACCOUNT);
    revalidatePath(ACCOUNT_URLS.WISHLIST);
    revalidatePath(ACCOUNT_URLS.ORDERS);
    revalidatePath(ACCOUNT_URLS.REVIEWS);

    return { ok: true, imageUrl: trimmed };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "프로필 이미지 저장 중 오류가 발생했습니다.";
    return { ok: false, error: message };
  }
}
