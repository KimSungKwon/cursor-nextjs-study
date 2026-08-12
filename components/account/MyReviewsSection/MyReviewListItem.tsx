import Link from "next/link";
import type { MyReviewItem } from "@/components/account/reviews/types";
import { ReviewCard } from "@/components/commerce/ReviewCard/ReviewCard";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { COMMERCE_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";

export type MyReviewListItemProps = {
  review: MyReviewItem;
  currentUserId: string;
  authorName: string;
  avatarUrl?: string | null;
  className?: string;
};

/**
 * 마이페이지 리뷰 한 건 — 상품 상세 링크 + ReviewCard(수정/삭제)
 */
export const MyReviewListItem = ({
  review,
  currentUserId,
  authorName,
  avatarUrl = null,
  className,
}: MyReviewListItemProps) => {
  const productHref = COMMERCE_URLS.PRODUCT_DETAIL(review.product.id);
  const productImage = review.product.imageUrl?.trim() || null;

  return (
    <article className={cn("flex flex-col gap-4", className)}>
      <Link
        href={productHref}
        className="flex items-center gap-3 rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ outlineColor: commerceColors.primary.main }}
        aria-label={`${review.product.name} 상품 상세 보기`}
      >
        <div
          className="size-14 shrink-0 overflow-hidden rounded-lg"
          style={{ backgroundColor: commerceColors.background.light }}
        >
          {productImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- 외부/스토리지 상품 이미지
            <img
              src={productImage}
              alt=""
              className="size-full object-cover"
            />
          ) : null}
        </div>
        <p
          className="min-w-0 truncate"
          style={{
            fontFamily: commerceTypography.fontFamily.body,
            fontSize: commerceTypography.body.md.semibold.fontSize,
            fontWeight: commerceTypography.fontWeight.semibold,
            lineHeight: "26px",
            color: commerceColors.text.primary,
          }}
        >
          {review.product.name}
        </p>
      </Link>

      <ReviewCard
        reviewId={review.id}
        productId={review.productId}
        authorUserId={review.userId}
        currentUserId={currentUserId}
        authorName={authorName}
        avatarUrl={avatarUrl ?? undefined}
        rating={review.rating}
        body={review.content}
      />
    </article>
  );
};
