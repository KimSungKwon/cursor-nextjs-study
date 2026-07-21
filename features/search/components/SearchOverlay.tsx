"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { COMMERCE_URLS } from "@/commons/constants/url";
import { useInfiniteScroll } from "@/commons/hooks/useInfiniteScroll";
import { useCartStore } from "@/commons/store/cart-store";
import { cn } from "@/commons/utils/cn";
import { ProductGrid } from "@/components/commerce/ProductGrid/ProductGrid";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useInfiniteProducts } from "@/features/products/api/useInfiniteProducts";
import { useProductSearch } from "@/features/search/api/useProductSearch";
import { useSearchStore } from "@/features/search/store/searchStore";

/** Figma Navigation Bar 높이 */
const HEADER_HEIGHT = 60;

/** Figma Feedback_Form/Off/On 스트립 높이 */
const SEARCH_BAR_HEIGHT = 112;

/** Figma Feedback_Form/ 너비 */
const SEARCH_FORM_MAX_WIDTH = 1120;

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M20 20L16.5 16.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export function SearchOverlay() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = useSearchStore((state) => state.isOpen);
  const keyword = useSearchStore((state) => state.keyword);
  const close = useSearchStore((state) => state.close);
  const setKeyword = useSearchStore((state) => state.setKeyword);

  const addItem = useCartStore((state) => state.addItem);
  const hasKeyword = keyword.trim().length > 0;

  const {
    data: searchResults,
    isLoading: isSearchLoading,
    isError: isSearchError,
    error: searchError,
  } = useProductSearch(keyword);

  const {
    data: infiniteData,
    isLoading: isListLoading,
    isError: isListError,
    error: listError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts();

  const listProducts = infiniteData?.pages.flatMap((page) => page.items) ?? [];
  const products = hasKeyword ? (searchResults ?? []) : listProducts;
  const isLoading = hasKeyword ? isSearchLoading : isListLoading;
  const isError = hasKeyword ? isSearchError : isListError;
  const error = hasKeyword ? searchError : listError;

  const loadMoreRef = useInfiniteScroll({
    onLoadMore: () => {
      if (hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    enabled:
      isOpen &&
      !hasKeyword &&
      hasNextPage === true &&
      isFetchingNextPage === false,
  });

  useEffect(() => {
    if (!isOpen) return;

    inputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

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
    close();
    router.push(COMMERCE_URLS.PRODUCT_DETAIL(productId));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="상품 검색"
      aria-hidden={!isOpen}
      className={cn(
        "fixed right-0 bottom-0 left-0 z-[100] flex flex-col bg-[var(--commerce-background-default)]",
        "transition-all duration-200 ease-out",
        isOpen
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-4 opacity-0",
      )}
      style={{ top: HEADER_HEIGHT }}
      onClick={close}
    >
      {/* Figma: Feedback_Form/Off/On — 1440×112, 중앙 검색바 */}
      <div
        className="flex shrink-0 items-center justify-center bg-[var(--commerce-background-default)] px-4 sm:px-6 lg:px-10 xl:px-40"
        style={{ height: SEARCH_BAR_HEIGHT }}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Figma: Feedback_Form/ — 1120×72, radius 16, border #e8ecef */}
        <div
          className={cn(
            "flex h-[72px] w-full items-center gap-5 rounded-2xl border px-6",
            "border-[var(--commerce-border-light)] bg-[var(--commerce-background-paper)]",
          )}
          style={{ maxWidth: SEARCH_FORM_MAX_WIDTH }}
        >
          <span
            className="shrink-0 text-[var(--commerce-text-secondary)]"
            aria-hidden
          >
            <SearchIcon />
          </span>

          <input
            ref={inputRef}
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search for products..."
            aria-label="Search for products"
            className={cn(
              "h-full w-full min-w-0 bg-transparent outline-none",
              "text-[var(--commerce-text-secondary)]",
              "placeholder:text-[color:var(--search-placeholder)]",
            )}
            style={{
              fontFamily: "var(--commerce-body-md-regular-font-family)",
              fontSize: "var(--commerce-body-md-regular-font-size)",
              lineHeight: "26px",
              // Figma placeholder #99a1af
              ["--search-placeholder" as string]: "#99a1af",
            }}
          />

          {/* Figma: Search 버튼 132×40, radius 80 */}
          <Button
            type="button"
            variant="pill"
            size="sm"
            aria-label="검색 실행"
            className="hidden h-10 w-[132px] shrink-0 sm:inline-flex"
            onClick={() => inputRef.current?.focus()}
          >
            Search
          </Button>
        </div>
      </div>

      {/* Figma: Product Carousel — 타이틀 All + 4열 그리드 */}
      <div
        className={cn(
          "flex-1 overflow-y-auto",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto w-full max-w-[1320px] px-4 py-8 sm:px-6 lg:px-10 xl:px-40">
          {!hasKeyword ? (
            <h2
              className="mb-8 text-center font-medium text-[var(--commerce-text-primary)] sm:mb-12"
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
          ) : null}

          {isError ? (
            <p
              role="alert"
              className="py-16 text-center text-[var(--commerce-semantic-error)]"
              style={{ fontFamily: "var(--commerce-font-family-body)" }}
            >
              {error instanceof Error
                ? error.message
                : "상품을 불러오지 못했습니다."}
            </p>
          ) : (
            <>
              <ProductGrid
                products={products}
                columns={4}
                isLoading={isLoading}
                emptyMessage={
                  hasKeyword ? "검색 결과가 없습니다." : "상품이 없습니다."
                }
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
                style={{ columnGap: 24, rowGap: 48 }}
              />

              {!hasKeyword && hasNextPage ? (
                <div ref={loadMoreRef} className="h-8" aria-hidden />
              ) : null}

              {!hasKeyword && isFetchingNextPage ? (
                <LoadingSpinner className="mt-8" />
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
