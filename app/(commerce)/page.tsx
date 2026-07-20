"use client";

import { useRouter } from "next/navigation";
import { COMMERCE_URLS } from "@/commons/constants/url";
import { useInfiniteScroll } from "@/commons/hooks/useInfiniteScroll";
import { useCartStore } from "@/commons/store/cart-store";
import { HomeHeroSection } from "@/components/commerce/home/HomeHeroSection";
import { ProductGrid } from "@/components/commerce/ProductGrid/ProductGrid";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useInfiniteProducts } from "@/features/products/api/useInfiniteProducts";

const CommerceHomePage = () => {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts();

  const products = data?.pages.flatMap((page) => page.items) ?? [];

  const loadMoreRef = useInfiniteScroll({
    onLoadMore: () => {
      if (hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    enabled: hasNextPage === true && isFetchingNextPage === false,
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
    <>
      <section className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 xl:px-40">
        <h2
          className="mb-8 text-center font-medium text-[var(--commerce-text-primary)] sm:mb-10"
          style={{
            fontFamily: "var(--commerce-headline-h4-font-family)",
            fontSize:
              "clamp(1.75rem, 4vw, var(--commerce-headline-h4-font-size))",
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
        ) : (
          <>
            <ProductGrid
              products={products}
              columns={4}
              isLoading={isLoading}
              onAddToCart={handleAddToCart}
              onProductClick={handleProductClick}
              style={{ columnGap: 24, rowGap: 48 }}
            />

            {hasNextPage ? (
              <div ref={loadMoreRef} className="h-8" aria-hidden />
            ) : null}

            {isFetchingNextPage ? (
              <LoadingSpinner className="mt-8" />
            ) : null}
          </>
        )}
      </section>

      <HomeHeroSection />
    </>
  );
};

export default CommerceHomePage;
