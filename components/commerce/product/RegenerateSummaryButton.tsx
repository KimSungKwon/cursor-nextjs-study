"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isAdmin) {
    return null;
  }

  const handleClick = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
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
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      loading={isGenerating}
      leftIcon={<FaMagic size={14} aria-hidden />}
      onClick={() => {
        void handleClick();
      }}
    >
      {isGenerating ? "생성 중..." : "AI 리뷰 요약 생성"}
    </Button>
  );
};
