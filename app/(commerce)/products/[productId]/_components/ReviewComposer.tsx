"use client";

import Link from "next/link";
import { AUTH_URLS } from "@/commons/constants/url";
import { useAuth } from "@/commons/hooks/useAuth";
import { cn } from "@/commons/utils/cn";
import { ReviewForm } from "@/components/commerce/ReviewForm";
import { Button } from "@/components/ui/Button";

export type ReviewComposerProps = {
  productId: string;
};

/**
 * 리뷰 작성 폼 또는 로그인 안내
 */
export const ReviewComposer = ({ productId }: ReviewComposerProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <ReviewForm productId={productId} />;
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col items-start gap-4 rounded-2xl border border-[var(--commerce-border-light)]",
        "bg-[var(--commerce-background-paper)] p-6 sm:flex-row sm:items-center sm:justify-between",
      )}
    >
      <p
        className="text-[var(--commerce-text-tertiary)]"
        style={{
          fontFamily: "var(--commerce-body-md-regular-font-family)",
          fontSize: "var(--commerce-body-md-regular-font-size)",
          lineHeight: "26px",
        }}
      >
        리뷰를 작성하려면 로그인해 주세요.
      </p>
      <Link href={AUTH_URLS.LOGIN}>
        <Button type="button" variant="solid" size="sm" className="shrink-0">
          로그인
        </Button>
      </Link>
    </div>
  );
};
