"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { FaMagic } from "react-icons/fa";
import { generateAiReviewSummary } from "@/app/(commerce)/products/[productId]/review-summary-actions";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { Button } from "@/components/ui/Button";
import type { ReviewSummaryResult } from "@/lib/ai/review-summary";

export type RetryHistoryItem = {
  attemptedAt: string;
  success: boolean;
  message: string;
};

export type RetryState = {
  retryCount: number;
  maxRetries: number;
  lastError: string | null;
  retryHistory: RetryHistoryItem[];
};

export type RetryReviewSummaryButtonProps = {
  productId: string;
  isAdmin: boolean;
  onRegenerated?: (summary: ReviewSummaryResult) => void;
};

const MAX_RETRIES = 3;

const INITIAL_RETRY_STATE: RetryState = {
  retryCount: 0,
  maxRetries: MAX_RETRIES,
  lastError: null,
  retryHistory: [],
};

/**
 * admin 전용 AI 리뷰 요약 재생성 버튼 (재시도 제한)
 */
export const RetryReviewSummaryButton = ({
  productId,
  isAdmin,
  onRegenerated,
}: RetryReviewSummaryButtonProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [retryState, setRetryState] = useState<RetryState>(INITIAL_RETRY_STATE);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  if (!isAdmin) {
    return null;
  }

  const remaining = retryState.maxRetries - retryState.retryCount;
  const isExhausted = remaining <= 0;

  const handleClick = () => {
    if (isPending || isExhausted) return;

    startTransition(async () => {
      const nextCount = retryState.retryCount + 1;
      try {
        const result = await generateAiReviewSummary(productId);
        if (!result.ok) {
          const lastError = result.error;
          setRetryState((prev) => ({
            ...prev,
            retryCount: nextCount,
            lastError,
            retryHistory: [
              ...prev.retryHistory,
              {
                attemptedAt: new Date().toISOString(),
                success: false,
                message: lastError,
              },
            ],
          }));
          toast.error(lastError);
          return;
        }

        setRetryState((prev) => ({
          ...prev,
          retryCount: nextCount,
          lastError: null,
          retryHistory: [
            ...prev.retryHistory,
            {
              attemptedAt: new Date().toISOString(),
              success: true,
              message: "생성 성공",
            },
          ],
        }));
        toast.success("AI 리뷰 요약이 생성되었습니다.");
        onRegenerated?.(result.summary);
        if (!onRegenerated) {
          router.refresh();
        }
      } catch (error) {
        const lastError =
          error instanceof Error
            ? error.message
            : "AI 리뷰 요약 생성에 실패했습니다.";
        setRetryState((prev) => ({
          ...prev,
          retryCount: nextCount,
          lastError,
          retryHistory: [
            ...prev.retryHistory,
            {
              attemptedAt: new Date().toISOString(),
              success: false,
              message: lastError,
            },
          ],
        }));
        toast.error(lastError);
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        loading={isPending}
        disabled={isPending || isExhausted}
        leftIcon={<FaMagic size={14} aria-hidden />}
        onClick={handleClick}
      >
        {isPending
          ? "재생성 중..."
          : isExhausted
            ? "재시도 횟수 초과"
            : `리뷰 요약 재생성 (${remaining}회 남음)`}
      </Button>

      {retryState.lastError ? (
        <p
          role="alert"
          style={{
            fontFamily: commerceTypography.fontFamily.body,
            fontSize: commerceTypography.caption.md.regular.fontSize,
            lineHeight: "22px",
            color: commerceColors.semantic.error,
          }}
        >
          {retryState.lastError}
        </p>
      ) : null}

      {retryState.retryHistory.length > 0 ? (
        <div className="flex w-full flex-col items-end gap-1">
          <button
            type="button"
            className="transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              fontFamily: commerceTypography.fontFamily.body,
              fontSize: commerceTypography.caption.md.regular.fontSize,
              color: commerceColors.text.tertiary,
              outlineColor: commerceColors.primary.main,
            }}
            aria-expanded={isHistoryOpen}
            onClick={() => setIsHistoryOpen((open) => !open)}
          >
            {isHistoryOpen ? "히스토리 닫기" : "히스토리 보기"}
          </button>
          {isHistoryOpen ? (
            <ol
              className="flex w-full max-w-[360px] flex-col gap-1"
              aria-label="재생성 히스토리"
            >
              {retryState.retryHistory.map((item, index) => (
                <li
                  key={`${item.attemptedAt}-${index}`}
                  style={{
                    fontFamily: commerceTypography.fontFamily.body,
                    fontSize: commerceTypography.caption.md.regular.fontSize,
                    lineHeight: "22px",
                    color: item.success
                      ? commerceColors.semantic.success
                      : commerceColors.semantic.error,
                  }}
                >
                  {index + 1}. {item.success ? "성공" : "실패"} — {item.message}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
