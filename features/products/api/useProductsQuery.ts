import type { Product } from "@/components/commerce/types";

export function useProductsQuery() {
  return {
    data: [] as Product[],
    isLoading: false,
  };
}
