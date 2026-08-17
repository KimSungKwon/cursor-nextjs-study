import { notFound } from "next/navigation";
import { isProductLiked } from "@/app/(commerce)/likes/actions";
import { ProductDetail } from "@/components/commerce/ProductDetail/ProductDetail";
import { getProductById } from "@/features/products/api/useProductDetail";

export type ProductHeroSectionProps = {
  productId: string;
};

/**
 * 상품 이미지·정보·장바구니 영역 (async)
 */
export const ProductHeroSection = async ({
  productId,
}: ProductHeroSectionProps) => {
  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  const liked = await isProductLiked(product.id);

  return <ProductDetail product={{ ...product, isLiked: liked }} />;
};
