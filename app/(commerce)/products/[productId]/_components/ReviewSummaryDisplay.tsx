"use client";

import type { HTMLAttributes } from "react";
import { FaRobot } from "react-icons/fa";
import { cn } from "@/commons/utils/cn";

const MOCK_AI_SUMMARY =
  "이 제품은 음질과 착용감에서 높은 평가를 받고 있습니다. 대부분의 고객들이 가격 대비 성능이 우수하다고 평가하며, 특히 노이즈 캔슬링 기능과 블루투스 연결성을 칭찬하고 있습니다. 일부 사용자는 배터리 수명이 아쉽다고 언급했지만, 전반적으로 만족도가 매우 높은 제품입니다.";

export interface ReviewSummaryDisplayProps
  extends HTMLAttributes<HTMLElement> {
  summary?: string;
}

export const ReviewSummaryDisplay = ({
  summary = MOCK_AI_SUMMARY,
  className,
  ...props
}: ReviewSummaryDisplayProps) => {
  return (
    <section
      className={cn(
        "rounded-lg bg-[var(--commerce-background-subtle)]/50 p-6",
        className,
      )}
      aria-label="AI 리뷰 요약"
      {...props}
    >
      <div className="flex gap-4">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--commerce-text-tertiary)] text-[var(--commerce-text-inverse)]"
          aria-hidden
        >
          <FaRobot size={24} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <h3
              className="text-[var(--commerce-text-secondary)]"
              style={{
                fontFamily: "var(--commerce-body-md-semibold-font-family)",
                fontSize: "var(--commerce-body-md-semibold-font-size)",
                fontWeight: "var(--commerce-body-md-semibold-font-weight)",
                lineHeight: "26px",
              }}
            >
              AI Review
            </h3>
            <span
              className="inline-flex size-4 items-center justify-center rounded-full bg-[var(--commerce-primary-dark)] text-[10px] text-[var(--commerce-text-inverse)]"
              aria-label="검증된 AI 요약"
              title="Verified AI summary"
            >
              ✓
            </span>
          </div>
          <p
            className="text-[var(--commerce-text-secondary)]"
            style={{
              fontFamily: "var(--commerce-caption-md-regular-font-family)",
              fontSize: "var(--commerce-caption-md-regular-font-size)",
              fontWeight: "var(--commerce-caption-md-regular-font-weight)",
              lineHeight: "24px",
            }}
          >
            {summary}
          </p>
        </div>
      </div>
    </section>
  );
};
