import { ProductGrid } from "@/components/commerce/ProductGrid/ProductGrid";

/**
 * 상품 목록 라우트 전용 로딩 UI (/products)
 */
const ProductsLoading = () => {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 xl:px-40">
      <div
        className="mb-8 h-10 w-16 animate-pulse rounded sm:mb-10"
        style={{ backgroundColor: "var(--commerce-background-light)" }}
        aria-hidden
      />
      <ProductGrid products={[]} columns={4} isLoading />
    </section>
  );
};

export default ProductsLoading;
