import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductDetailSkeleton } from "@/components/ui/ProductDetailSkeleton";
import { ReviewListSkeleton } from "@/components/ui/ReviewListSkeleton";
import { ReviewSummarySkeleton } from "@/components/ui/ReviewSummarySkeleton";
import { getProductById } from "@/features/products/api/useProductDetail";
import { ProductHeroSection } from "./_components/ProductHeroSection";
import { ProductTabsSection } from "./_components/ProductTabsSection";

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

function ProductTabsFallback() {
  return (
    <div className="w-full">
      <div
        className="flex gap-10 border-b pb-2"
        style={{ borderColor: "var(--commerce-border-light)" }}
        aria-hidden
      >
        <div
          className="h-8 w-24 animate-pulse rounded"
          style={{ backgroundColor: "var(--commerce-background-light)" }}
        />
        <div
          className="h-8 w-36 animate-pulse rounded"
          style={{ backgroundColor: "var(--commerce-background-light)" }}
        />
      </div>
      <div className="flex flex-col gap-10 pt-10">
        <ReviewSummarySkeleton />
        <ReviewListSkeleton />
      </div>
    </div>
  );
}

const ProductDetailPage = async ({ params }: ProductDetailPageProps) => {
  const { productId } = await params;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-16 px-4 py-8 sm:px-6 lg:px-10 xl:px-40">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductHeroSection productId={productId} />
      </Suspense>
      <Suspense fallback={<ProductTabsFallback />}>
        <ProductTabsSection productId={productId} />
      </Suspense>
    </div>
  );
};

export default ProductDetailPage;
