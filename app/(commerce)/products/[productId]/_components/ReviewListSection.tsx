import { getProductReviewsPage } from "@/features/products/api/getProductReviewsPage";
import { ReviewList } from "./ReviewList";

export type ReviewListSectionProps = {
  productId: string;
};

/**
 * 리뷰 목록 조회 Server Component
 */
export const ReviewListSection = async ({
  productId,
}: ReviewListSectionProps) => {
  const firstPage = await getProductReviewsPage(productId, 0);

  return (
    <ReviewList productId={productId} initialItems={firstPage.items} />
  );
};
