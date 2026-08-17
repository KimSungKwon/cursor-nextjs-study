import { commerceColors } from "@/commons/constants/color";
import { cn } from "@/commons/utils/cn";

export type ProductDetailSkeletonProps = {
  className?: string;
};

/**
 * 상품 상세 상단(이미지 + 정보) 스켈레톤
 */
export const ProductDetailSkeleton = ({
  className,
}: ProductDetailSkeletonProps) => {
  return (
    <article
      className={cn("grid w-full gap-8 lg:grid-cols-2 lg:gap-12", className)}
      aria-busy
      aria-label="상품 정보 로딩 중"
    >
      <div
        className="aspect-[547/728] w-full animate-pulse"
        style={{ backgroundColor: commerceColors.background.light }}
      />
      <div className="flex flex-col gap-4">
        <div
          className="h-5 w-24 animate-pulse rounded"
          style={{ backgroundColor: commerceColors.background.light }}
        />
        <div
          className="h-10 w-3/4 animate-pulse rounded"
          style={{ backgroundColor: commerceColors.background.light }}
        />
        <div
          className="h-8 w-32 animate-pulse rounded"
          style={{ backgroundColor: commerceColors.background.light }}
        />
        <div
          className="mt-4 h-14 w-full animate-pulse rounded-lg"
          style={{ backgroundColor: commerceColors.background.light }}
        />
      </div>
    </article>
  );
};
