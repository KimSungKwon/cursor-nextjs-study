import { commerceColors } from "@/commons/constants/color";
import { cn } from "@/commons/utils/cn";

export type ReviewListSkeletonProps = {
  className?: string;
};

const ReviewCardSkeleton = () => {
  return (
    <div className="flex w-full max-w-[1120px] gap-7 pb-6" aria-hidden>
      <div
        className="size-[72px] shrink-0 animate-pulse rounded-full"
        style={{ backgroundColor: commerceColors.background.light }}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div
          className="h-5 w-32 animate-pulse rounded"
          style={{ backgroundColor: commerceColors.background.light }}
        />
        <div
          className="h-4 w-24 animate-pulse rounded"
          style={{ backgroundColor: commerceColors.background.light }}
        />
        <div className="flex flex-col gap-2">
          <div
            className="h-4 w-full animate-pulse rounded"
            style={{ backgroundColor: commerceColors.background.light }}
          />
          <div
            className="h-4 w-5/6 animate-pulse rounded"
            style={{ backgroundColor: commerceColors.background.light }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * 리뷰 리스트 스켈레톤 (카드 3개)
 */
export const ReviewListSkeleton = ({ className }: ReviewListSkeletonProps) => {
  return (
    <div
      className={cn("flex w-full flex-col gap-6", className)}
      role="status"
      aria-label="리뷰 목록 로딩 중"
      aria-busy
    >
      <ReviewCardSkeleton />
      <ReviewCardSkeleton />
      <ReviewCardSkeleton />
    </div>
  );
};
