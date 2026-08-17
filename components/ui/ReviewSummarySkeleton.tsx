import { commerceColors } from "@/commons/constants/color";
import { cn } from "@/commons/utils/cn";

export type ReviewSummarySkeletonProps = {
  className?: string;
};

/**
 * AI 리뷰 요약 영역 스켈레톤 (텍스트 3줄 + 태그 3개)
 */
export const ReviewSummarySkeleton = ({
  className,
}: ReviewSummarySkeletonProps) => {
  return (
    <section
      className={cn("rounded-lg p-6", className)}
      style={{ backgroundColor: `${commerceColors.background.subtle}80` }}
      aria-label="AI 리뷰 요약 로딩 중"
      aria-busy
    >
      <div className="flex gap-4">
        <div
          className="size-12 shrink-0 animate-pulse rounded-full"
          style={{ backgroundColor: commerceColors.background.light }}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div
            className="h-5 w-24 animate-pulse rounded"
            style={{ backgroundColor: commerceColors.background.light }}
          />
          <div className="flex flex-col gap-2">
            <div
              className="h-4 w-full animate-pulse rounded"
              style={{ backgroundColor: commerceColors.background.light }}
            />
            <div
              className="h-4 w-11/12 animate-pulse rounded"
              style={{ backgroundColor: commerceColors.background.light }}
            />
            <div
              className="h-4 w-4/5 animate-pulse rounded"
              style={{ backgroundColor: commerceColors.background.light }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div
              className="h-7 w-16 animate-pulse rounded-full"
              style={{ backgroundColor: commerceColors.background.light }}
            />
            <div
              className="h-7 w-20 animate-pulse rounded-full"
              style={{ backgroundColor: commerceColors.background.light }}
            />
            <div
              className="h-7 w-14 animate-pulse rounded-full"
              style={{ backgroundColor: commerceColors.background.light }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
