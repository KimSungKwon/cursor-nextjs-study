import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/commerce/ProductDetail/ProductDetail";
import { getProductById } from "@/features/products/api/useProductDetail";

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

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 xl:px-40">
      <ProductDetail product={product} />
    </section>
  );
};

export default ProductDetailPage;
