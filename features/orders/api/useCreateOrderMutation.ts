"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import type {
  CreateOrderInput,
  CreateOrderResult,
} from "@/features/orders/api/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// orders insert 후 반환되는 최소 필드
interface OrderRow {
  id: string;
}

/**
 * Supabase에 주문(orders)과 주문 항목(order_items)을 생성하는 Mutation 훅
 *
 * @example
 * const { mutate, isPending, isSuccess, isError } = useCreateOrderMutation();
 *
 * mutate({
 *   userId: "user-uuid",
 *   items: [{ productId: "product-uuid", quantity: 2, unitPrice: 99000 }],
 * });
 */
export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation<CreateOrderResult, Error, CreateOrderInput>({
    mutationFn: async (input) => {
      const supabase = getSupabaseBrowserClient();

      // 주문 총액 = 각 항목의 (단가 × 수량) 합계
      const totalAmount = input.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      );

      // 1) orders 테이블에 주문 생성 (status: pending, payment_status: requested)
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: input.userId,
          total_amount: totalAmount,
          subtotal_amount: totalAmount,
          status: "pending",
          payment_status: "requested",
        } as never) // TODO: types/supabase.ts 생성 후 as never 제거
        .select("id")
        .single();

      if (orderError) {
        throw new Error(`주문 생성 실패: ${orderError.message}`);
      }

      const orderId = (order as OrderRow).id;

      // 2) order_items 테이블에 주문 상품 항목 일괄 생성
      const orderItems = input.items.map((item) => ({
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        line_subtotal: item.unitPrice * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems as never); // TODO: types/supabase.ts 생성 후 as never 제거

      if (itemsError) {
        throw new Error(`주문 항목 생성 실패: ${itemsError.message}`);
      }

      return { orderId };
    },

    // 주문 생성 성공 시 주문 목록 캐시 무효화 → 최신 데이터 재조회
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.all });
    },
  });
}
