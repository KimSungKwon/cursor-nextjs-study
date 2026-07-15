"use client";

import { useRouter } from "next/navigation";
import { COMMERCE_URLS } from "@/commons/constants/url";
import { useCartStore } from "@/commons/store/cart-store";
import { cn } from "@/commons/utils/cn";
import { ProductCard } from "@/components/commerce/ProductCard/ProductCard";
import { useProductsQuery } from "@/features/products/api/useProductsQuery";

const PRODUCT_LIMIT = 12;

const ProductCardSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-3" aria-hidden>
      <div className="aspect-[262/349] w-full animate-pulse rounded bg-[var(--commerce-background-light)]" />
      <div className="h-4 w-24 animate-pulse rounded bg-[var(--commerce-background-subtle)]" />
      <div className="h-5 w-40 animate-pulse rounded bg-[var(--commerce-background-subtle)]" />
      <div className="h-4 w-28 animate-pulse rounded bg-[var(--commerce-background-subtle)]" />
    </div>
  );
};

export const HomePage = () => {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const { data: products = [], isLoading, isError, error } = useProductsQuery({
    limit: PRODUCT_LIMIT,
  });

  const handleAddToCart = (productId: string) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || null,
      salePrice: product.salePrice ?? null,
    });
  };

  const handleProductClick = (productId: string) => {
    router.push(COMMERCE_URLS.PRODUCT_DETAIL(productId));
  };

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 xl:px-40">
      <h2
        className="mb-8 text-center font-medium text-[var(--commerce-text-primary)] sm:mb-10"
        style={{
          fontFamily: "var(--commerce-headline-h4-font-family)",
          fontSize: "clamp(1.75rem, 4vw, var(--commerce-headline-h4-font-size))",
          lineHeight: "var(--commerce-headline-h4-line-height)",
          fontWeight: 500,
        }}
      >
        All
      </h2>

      {isError ? (
        <p
          role="alert"
          className="py-16 text-center text-[var(--commerce-semantic-error)]"
          style={{ fontFamily: "var(--commerce-font-family-body)" }}
        >
          {error instanceof Error
            ? error.message
            : "상품 목록을 불러오지 못했습니다."}
        </p>
      ) : null}

      {!isError && isLoading ? (
        <div
          role="status"
          aria-label="상품 목록 로딩 중"
          aria-busy
          className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4"
        >
          {Array.from({ length: PRODUCT_LIMIT }, (_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {!isError && !isLoading && products.length === 0 ? (
        <p
          role="status"
          className="py-16 text-center text-[var(--commerce-text-tertiary)]"
          style={{ fontFamily: "var(--commerce-font-family-body)" }}
        >
          상품이 없습니다.
        </p>
      ) : null}

      {!isError && !isLoading && products.length > 0 ? (
        <div
          className={cn(
            "grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4",
            "justify-items-center",
          )}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              className="w-full max-w-[262px]"
              onAddToCart={handleAddToCart}
              onClick={handleProductClick}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
};
