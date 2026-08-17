import { notFound } from "next/navigation";
import { getProductById } from "@/features/products/api/useProductDetail";
import { ProductDetailTabs } from "./ProductDetailTabs";
import { ProductReviewsSection } from "./ProductReviewsSection";

export type ProductTabsSectionProps = {
  productId: string;
};

/**
 * 상품 상세 탭 + 리뷰 (async, 리뷰는 내부 Suspense로 스트리밍)
 */
export const ProductTabsSection = async ({
  productId,
}: ProductTabsSectionProps) => {
  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  const additionalInfo =
    product.additional_info?.trim() || "추가 정보가 없습니다.";

  return (
    <ProductDetailTabs
      additionalInfoContent={
        <p
          className="whitespace-pre-wrap text-[var(--commerce-text-tertiary)]"
          style={{
            fontFamily: "var(--commerce-body-md-regular-font-family)",
            fontSize: "var(--commerce-body-md-regular-font-size)",
            fontWeight: "var(--commerce-body-md-regular-font-weight)",
            lineHeight: "26px",
          }}
        >
          {additionalInfo}
        </p>
      }
      reviewsContent={<ProductReviewsSection productId={product.id} />}
    />
  );
};
