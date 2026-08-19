"use client";

import type { CSSProperties } from "react";

export type StepStatus = "pending" | "processing" | "completed" | "failed";

export interface ReviewSummaryStep {
  id: string;
  label: string;
  description: string;
  status: StepStatus;
}

export const INITIAL_STEPS: ReviewSummaryStep[] = [
  {
    id: "prepare",
    label: "준비",
    description: "리뷰 데이터를 불러오는 중입니다.",
    status: "pending",
  },
  {
    id: "analyze",
    label: "분석",
    description: "리뷰 내용을 분석하는 중입니다.",
    status: "pending",
  },
  {
    id: "generate",
    label: "생성",
    description: "AI가 요약을 작성하는 중입니다.",
    status: "pending",
  },
  {
    id: "complete",
    label: "완료",
    description: "AI 요약이 완성되었습니다.",
    status: "pending",
  },
];

export type ReviewSummaryStepIndicatorProps = {
  steps: ReviewSummaryStep[];
};

const statusIcon = (status: StepStatus, index: number) => {
  if (status === "completed") {
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden
      >
        <path
          d="M2 6l3 3 5-5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (status === "failed") {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path
          d="M3 3l6 6M9 3l-6 6"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (status === "processing") {
    return (
      <span
        className="animate-spin"
        style={{
          display: "block",
          width: 12,
          height: 12,
          border: "2px solid var(--commerce-primary-main)",
          borderTopColor: "transparent",
          borderRadius: "50%",
        }}
        aria-hidden
      />
    );
  }
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        color: "var(--commerce-text-tertiary)",
        lineHeight: 1,
      }}
    >
      {index + 1}
    </span>
  );
};

const dotStyle = (status: StepStatus): CSSProperties => {
  const base: CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "background 0.2s, border-color 0.2s",
  };
  if (status === "completed") {
    return { ...base, background: "var(--commerce-semantic-success)" };
  }
  if (status === "failed") {
    return { ...base, background: "var(--commerce-semantic-error)" };
  }
  if (status === "processing") {
    return {
      ...base,
      background: "transparent",
      border: "2px solid var(--commerce-primary-main)",
    };
  }
  return {
    ...base,
    background: "transparent",
    border: "2px solid var(--commerce-border-default)",
  };
};

const lineStyle = (prevStatus: StepStatus): CSSProperties => ({
  width: 2,
  flexGrow: 1,
  minHeight: 16,
  margin: "2px 0",
  marginLeft: 13,
  borderRadius: 1,
  background:
    prevStatus === "completed"
      ? "var(--commerce-primary-main)"
      : "var(--commerce-border-default)",
  transition: "background 0.3s",
});

/**
 * AI 요약 생성 단계를 시각적으로 표시하는 Step Indicator
 */
export const ReviewSummaryStepIndicator = ({
  steps,
}: ReviewSummaryStepIndicatorProps) => {
  return (
    <div
      role="status"
      aria-label="AI 요약 생성 진행 단계"
      style={{ display: "flex", flexDirection: "column" }}
    >
      {steps.map((step, index) => (
        <div key={step.id} style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={dotStyle(step.status)}>
              {statusIcon(step.status, index)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: step.status === "processing" ? 600 : 400,
                  color:
                    step.status === "pending"
                      ? "var(--commerce-text-tertiary)"
                      : "var(--commerce-text-primary)",
                  fontFamily: "var(--commerce-font-family-body)",
                  transition: "color 0.2s",
                }}
              >
                {step.label}
              </span>
              {step.status !== "pending" ? (
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--commerce-text-tertiary)",
                    fontFamily: "var(--commerce-font-family-body)",
                  }}
                >
                  {step.description}
                </span>
              ) : null}
            </div>
          </div>

          {index < steps.length - 1 ? (
            <div style={lineStyle(step.status)} />
          ) : null}
        </div>
      ))}
    </div>
  );
};
