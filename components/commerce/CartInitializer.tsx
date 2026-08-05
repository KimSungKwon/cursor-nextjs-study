"use client";

import { useInitCart } from "@/commons/hooks/useInitCart";

/**
 * Commerce 레이아웃에서 장바구니 hydrate·서버 동기화를 수행한다.
 */
export const CartInitializer = () => {
  useInitCart();
  return null;
};
