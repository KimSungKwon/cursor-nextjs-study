import { AccountPagination } from "@/components/account/AccountPagination/AccountPagination";
import { MyReviewListItem } from "@/components/account/MyReviewsSection/MyReviewListItem";
import { MyReviewsEmptyState } from "@/components/account/MyReviewsSection/MyReviewsEmptyState";
import type { MyReviewItem } from "@/components/account/reviews/types";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";

export type MyReviewsSectionProps = {
  reviews: MyReviewItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  currentUserId: string;
  authorName: string;
  avatarUrl?: string | null;
  className?: string;
};

/**
 * 마이페이지 리뷰 내역 섹션
 */
export const MyReviewsSection = ({
  reviews,
  totalCount,
  totalPages,
  currentPage,
  currentUserId,
  authorName,
  avatarUrl = null,
  className,
}: MyReviewsSectionProps) => {
  const headline = commerceTypography.headline.h7;

  return (
    <section className={cn("flex w-full max-w-[707px] flex-col", className)}>
      <h2
        className="mb-10"
        style={{
          fontFamily: headline.fontFamily,
          fontSize: headline.fontSize,
          fontWeight: headline.fontWeight,
          lineHeight: headline.lineHeight,
          color: commerceColors.text.primary,
        }}
      >
        Reviews
      </h2>

      {totalCount === 0 ? (
        <MyReviewsEmptyState />
      ) : (
        <div className="flex flex-col gap-10">
          <ul className="flex flex-col gap-8">
            {reviews.map((review) => (
              <li key={review.id}>
                <MyReviewListItem
                  review={review}
                  currentUserId={currentUserId}
                  authorName={authorName}
                  avatarUrl={avatarUrl}
                />
              </li>
            ))}
          </ul>
          <AccountPagination
            page={currentPage}
            totalPages={totalPages}
            basePath={ACCOUNT_URLS.REVIEWS}
          />
        </div>
      )}
    </section>
  );
};
