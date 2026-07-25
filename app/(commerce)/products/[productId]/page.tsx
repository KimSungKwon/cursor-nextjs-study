import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/commerce/ProductDetail/ProductDetail";
import { getProductById } from "@/features/products/api/useProductDetail";
import { ProductDetailTabs } from "./_components/ProductDetailTabs";

type ProductDetailPageProps = {
  params: Promise<{ productId: string }>;
};

const DEFAULT_TITLE = "상품 상세 - Cursor Commerce";
const DEFAULT_DESCRIPTION = "Cursor Commerce에서 다양한 상품을 만나보세요.";

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = await getProductById(productId);

  if (!product) {
    return {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
    };
  }

  const description = product.description?.trim() || DEFAULT_DESCRIPTION;
  const imageUrl = product.imageUrl.trim();

  return {
    title: `${product.name} - Cursor Commerce`,
    description,
    keywords: [product.name, "상품", "커머스"],
    openGraph: {
      title: product.name,
      description,
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: product.name }]
        : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

const ProductDetailPage = async ({ params }: ProductDetailPageProps) => {
  const { productId } = await params;
  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  const additionalInfo =
    product.additional_info?.trim() || "추가 정보가 없습니다.";

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-16 px-4 py-8 sm:px-6 lg:px-10 xl:px-40">
      <ProductDetail product={product} />
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
        reviewsContent={
          <p
            className="text-[var(--commerce-text-tertiary)]"
            style={{
              fontFamily: "var(--commerce-body-md-regular-font-family)",
              fontSize: "var(--commerce-body-md-regular-font-size)",
              lineHeight: "26px",
            }}
          >
            아직 등록된 리뷰가 없습니다.
          </p>
        }
      />
    </div>
  );
};

export default ProductDetailPage;
