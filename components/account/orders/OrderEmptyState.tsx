import Link from "next/link";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { COMMERCE_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";

export type OrderEmptyStateProps = {
  className?: string;
};

/**
 * 주문 내역이 비어 있을 때 표시하는 빈 상태 UI
 */
export const OrderEmptyState = ({ className }: OrderEmptyStateProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 py-16",
        className,
      )}
      role="status"
    >
      <HiOutlineShoppingBag
        size={40}
        color={commerceColors.border.light}
        aria-hidden
        className="shrink-0"
      />
      <div className="flex flex-col items-center gap-2 text-center">
        <p
          style={{
            fontFamily: commerceTypography.fontFamily.body,
            fontSize: commerceTypography.body.md.semibold.fontSize,
            fontWeight: commerceTypography.fontWeight.semibold,
            lineHeight: "26px",
            color: commerceColors.text.secondary,
          }}
        >
          주문 내역이 없습니다
        </p>
        <p
          style={{
            fontFamily: commerceTypography.fontFamily.body,
            fontSize: commerceTypography.caption.md.regular.fontSize,
            fontWeight: commerceTypography.fontWeight.regular,
            lineHeight: "22px",
            color: commerceColors.text.tertiary,
          }}
        >
          상품을 주문하면 여기에서 확인할 수 있습니다.
        </p>
      </div>
      <Link
        href={COMMERCE_URLS.PRODUCTS}
        className="inline-flex h-12 min-w-[160px] items-center justify-center rounded-lg px-5 transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          fontFamily: commerceTypography.fontFamily.body,
          fontSize: commerceTypography.button.sm.fontSize,
          fontWeight: commerceTypography.fontWeight.medium,
          lineHeight: "28px",
          letterSpacing: "-0.4px",
          backgroundColor: commerceColors.primary.main,
          color: commerceColors.text.inverse,
          outlineColor: commerceColors.primary.main,
        }}
      >
        쇼핑하러 가기
      </Link>
    </div>
  );
};
