import { cn } from "@/commons/utils/cn";
import { ProductInfoSection } from "@/components/commerce/product/ProductInfoSection";
import {
  toProductDetail,
  type ProductDetailData,
} from "@/features/products/api/useProductDetail";

export interface ProductDetailProps {
  product: ProductDetailData;
  className?: string;
}

/**
 * 상품 상세: 이미지 + 상품 정보 섹션
 */
export const ProductDetail = ({ product, className }: ProductDetailProps) => {
  const detail = toProductDetail(product);

  return (
    <article
      className={cn(
        "grid w-full gap-8 lg:grid-cols-2 lg:gap-12",
        className,
      )}
    >
      <div className="relative aspect-[547/728] w-full overflow-hidden bg-[var(--commerce-background-light)]">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center text-[var(--commerce-text-tertiary)]"
            style={{ fontFamily: "var(--commerce-font-family-body)" }}
          >
            No image
          </div>
        )}
      </div>

      <ProductInfoSection product={detail} />
    </article>
  );
};
