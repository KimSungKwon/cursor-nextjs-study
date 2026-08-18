"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";
import { Button } from "@/components/ui/Button";
import type { ReviewSummaryResult } from "@/lib/ai/review-summary";

export type DiffToken = {
  type: "added" | "removed" | "unchanged";
  value: string;
};

export function diffText(before: string, after: string): DiffToken[] {
  const a = tokenize(before);
  const b = tokenize(after);
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    Array.from({ length: m + 1 }, () => 0),
  );

  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] =
        a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const tokens: DiffToken[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      tokens.push({ type: "unchanged", value: a[i] });
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      tokens.push({ type: "removed", value: a[i] });
      i += 1;
    } else {
      tokens.push({ type: "added", value: b[j] });
      j += 1;
    }
  }
  while (i < n) {
    tokens.push({ type: "removed", value: a[i] });
    i += 1;
  }
  while (j < m) {
    tokens.push({ type: "added", value: b[j] });
    j += 1;
  }
  return tokens;
}

function tokenize(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

export type ReviewSummaryDiffProps = {
  previousSummary: ReviewSummaryResult;
  nextSummary: ReviewSummaryResult;
  onApprove: () => void;
  onReject: () => void;
  className?: string;
};

/**
 * 이전/이후 AI 요약 단어 단위 Diff
 */
export const ReviewSummaryDiff = ({
  previousSummary,
  nextSummary,
  onApprove,
  onReject,
  className,
}: ReviewSummaryDiffProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const tokens = useMemo(
    () => diffText(previousSummary.summary, nextSummary.summary),
    [previousSummary.summary, nextSummary.summary],
  );

  return (
    <section
      className={cn("flex flex-col gap-3 rounded-lg p-4", className)}
      style={{ backgroundColor: commerceColors.background.light }}
      aria-label="AI 요약 변경 비교"
    >
      <div className="flex items-center justify-between gap-3">
        <h4
          style={{
            fontFamily: commerceTypography.fontFamily.body,
            fontSize: commerceTypography.body.md.semibold.fontSize,
            fontWeight: commerceTypography.fontWeight.semibold,
            lineHeight: "26px",
            color: commerceColors.text.secondary,
          }}
        >
          변경 비교
        </h4>
        <button
          type="button"
          className="transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            fontFamily: commerceTypography.fontFamily.body,
            fontSize: commerceTypography.caption.md.regular.fontSize,
            color: commerceColors.text.tertiary,
            outlineColor: commerceColors.primary.main,
          }}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? "Diff 닫기" : "Diff 열기"}
        </button>
      </div>

      {isOpen ? (
        <p
          className="flex flex-wrap gap-1"
          style={{
            fontFamily: commerceTypography.fontFamily.body,
            fontSize: commerceTypography.caption.md.regular.fontSize,
            lineHeight: "24px",
            color: commerceColors.text.secondary,
          }}
        >
          {tokens.map((token, index) => (
            <span
              key={`${token.type}-${token.value}-${index}`}
              className="rounded-sm px-0.5"
              style={tokenStyle(token.type)}
            >
              {token.value}
            </span>
          ))}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onReject}>
          거부
        </Button>
        <Button type="button" variant="solid" size="sm" onClick={onApprove}>
          승인
        </Button>
      </div>
    </section>
  );
};

function tokenStyle(type: DiffToken["type"]): CSSProperties {
  if (type === "added") {
    return {
      backgroundColor: `${commerceColors.semantic.success}33`,
      color: commerceColors.text.secondary,
    };
  }
  if (type === "removed") {
    return {
      backgroundColor: `${commerceColors.semantic.error}33`,
      color: commerceColors.text.secondary,
      textDecoration: "line-through",
    };
  }
  return { color: commerceColors.text.secondary };
}
