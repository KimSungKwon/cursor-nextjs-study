"use client";

import { useEffect } from "react";
import { clearCheckoutOrderId } from "@/commons/utils/order";

type CheckoutResultClientProps = {
  clearOrderStorage?: boolean;
};

/** 결제 결과 페이지에서 sessionStorage 정리 */
export function CheckoutResultClient({
  clearOrderStorage = false,
}: CheckoutResultClientProps) {
  useEffect(() => {
    if (clearOrderStorage) {
      clearCheckoutOrderId();
    }
  }, [clearOrderStorage]);

  return null;
}
