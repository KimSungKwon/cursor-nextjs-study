import Link from "next/link";
import { FaShoppingBag } from "react-icons/fa";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { COMMERCE_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";

export type CartEmptyStateProps = {
  className?: string;
};

/**
 * 장바구니가 비어 있을 때 표시하는 빈 상태 UI
 */
export const CartEmptyState = ({ className }: CartEmptyStateProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 py-16",
        className,
      )}
      role="status"
    >
      <FaShoppingBag
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
          장바구니가 비어 있습니다
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
          원하는 상품을 담고 여기에서 주문해 보세요.
        </p>
      </div>
      <Link
        href={COMMERCE_URLS.HOME}
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
        쇼핑 계속하기
      </Link>
    </div>
  );
};
