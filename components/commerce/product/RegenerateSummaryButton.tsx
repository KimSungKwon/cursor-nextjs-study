"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { FaMagic } from "react-icons/fa";
import { generateAiReviewSummary } from "@/app/(commerce)/products/[productId]/review-summary-actions";
import { toast } from "@/commons/utils/toast";
import { Button } from "@/components/ui/Button";

export type RegenerateSummaryButtonProps = {
  productId: string;
  isAdmin: boolean;
  onGenerated?: () => void;
};

/**
 * admin 전용 AI 리뷰 요약 생성 버튼
 */
export const RegenerateSummaryButton = ({
  productId,
  isAdmin,
  onGenerated,
}: RegenerateSummaryButtonProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!isAdmin) {
    return null;
  }

  const handleClick = () => {
    if (isPending) return;

    startTransition(async () => {
      try {
        const result = await generateAiReviewSummary(productId);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }

        toast.success("AI 리뷰 요약이 생성되었습니다.");
        onGenerated?.();
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "AI 리뷰 요약 생성에 실패했습니다.",
        );
      }
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      loading={isPending}
      disabled={isPending}
      leftIcon={<FaMagic size={14} aria-hidden />}
      onClick={handleClick}
    >
      {isPending ? "재생성 중..." : "AI 리뷰 요약 생성"}
    </Button>
  );
};
