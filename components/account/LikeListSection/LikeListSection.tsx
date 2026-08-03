import { AccountPagination } from "@/components/account/AccountPagination/AccountPagination";
import { LikeEmptyState } from "@/components/account/LikeEmptyState/LikeEmptyState";
import { LikeListTable } from "@/components/account/LikeListTable/LikeListTable";
import type { WishlistItem } from "@/components/account/wishlist/types";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";

export type LikeListSectionProps = {
  items: WishlistItem[];
  totalCount: number;
  page: number;
  totalPages: number;
  className?: string;
};

/**
 * 찜 목록 섹션: 빈 상태 또는 테이블 + 페이지네이션
 */
export const LikeListSection = ({
  items,
  totalCount,
  page,
  totalPages,
  className,
}: LikeListSectionProps) => {
  return (
    <section className={cn("flex w-full max-w-[707px] flex-col", className)}>
      <h2
        className="mb-10"
        style={{
          fontFamily: commerceTypography.fontFamily.body,
          fontSize: commerceTypography.body.lg.semibold.fontSize,
          fontWeight: commerceTypography.fontWeight.semibold,
          lineHeight: "32px",
          color: commerceColors.text.primary,
        }}
      >
        Wishlist
      </h2>

      {totalCount === 0 ? (
        <LikeEmptyState />
      ) : (
        <div className="flex flex-col gap-10">
          <LikeListTable items={items} />
          <AccountPagination
            page={page}
            totalPages={totalPages}
            basePath={ACCOUNT_URLS.WISHLIST}
          />
        </div>
      )}
    </section>
  );
};
