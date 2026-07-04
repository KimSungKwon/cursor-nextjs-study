import type {
  CreateOrderInput,
  CreateOrderResult,
} from "@/features/orders/api/types";

export function useCreateOrderMutation() {
  return {
    mutate: (_payload: CreateOrderInput): CreateOrderResult => ({
      orderId: "placeholder-order-id",
    }),
    isPending: false,
  };
}
