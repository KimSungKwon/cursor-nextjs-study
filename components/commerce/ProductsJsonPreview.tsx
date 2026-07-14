"use client";

import { useProductsQuery } from "@/features/products/api/useProductsQuery";

export const ProductsJsonPreview = () => {
  const { data, isLoading, isError, error } = useProductsQuery({ limit: 20 });

  if (isLoading) {
    return <p className="text-sm text-zinc-600">상품 목록 로딩 중...</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600">
        상품 목록 조회 오류: {error?.message ?? "알 수 없는 오류"}
      </p>
    );
  }

  return (
    <pre className="overflow-x-auto rounded-md border bg-zinc-50 p-4 text-xs text-zinc-800">
      {JSON.stringify(data ?? [], null, 2)}
    </pre>
  );
};
