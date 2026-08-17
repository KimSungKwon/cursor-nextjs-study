"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { FaCheck, FaRegThumbsDown, FaRegThumbsUp, FaRobot } from "react-icons/fa";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";
import type { ReviewSummaryResult } from "@/lib/ai/review-summary";

export type ReviewSummaryDisplayProps = HTMLAttributes<HTMLElement> & {
  summary: ReviewSummaryResult | null;
};

/**
 * 상품 AI 리뷰 요약 영역
 */
export const ReviewSummaryDisplay = ({
  summary,
  className,
  ...props
}: ReviewSummaryDisplayProps) => {
  return (
    <section
      className={cn("rounded-lg p-6", className)}
      style={{ backgroundColor: `${commerceColors.background.subtle}80` }}
      aria-label="AI 리뷰 요약"
      {...props}
    >
      <div className="flex gap-4">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: commerceColors.text.tertiary,
            color: commerceColors.text.inverse,
          }}
          aria-hidden
        >
          <FaRobot size={24} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="flex items-center gap-2">
            <h3
              style={{
                fontFamily: commerceTypography.fontFamily.body,
                fontSize: commerceTypography.body.md.semibold.fontSize,
                fontWeight: commerceTypography.fontWeight.semibold,
                lineHeight: "26px",
                color: commerceColors.text.secondary,
              }}
            >
              AI Review
            </h3>
            {summary ? (
              <span
                className="inline-flex size-4 items-center justify-center rounded-full"
                style={{
                  backgroundColor: commerceColors.primary.dark,
                  color: commerceColors.text.inverse,
                  fontSize: "10px",
                }}
                aria-label="검증된 AI 요약"
                title="Verified AI summary"
              >
                <FaCheck size={8} aria-hidden />
              </span>
            ) : null}
          </div>

          {summary ? (
            <div className="flex flex-col gap-5">
              <p
                className="whitespace-pre-wrap"
                style={{
                  fontFamily: commerceTypography.fontFamily.body,
                  fontSize: commerceTypography.caption.md.regular.fontSize,
                  fontWeight: commerceTypography.fontWeight.regular,
                  lineHeight: "24px",
                  color: commerceColors.text.secondary,
                }}
              >
                {summary.summary}
              </p>

              {summary.positive_points.length > 0 ? (
                <SummaryPointList
                  title="긍정 포인트"
                  icon={<FaRegThumbsUp size={14} aria-hidden />}
                  items={summary.positive_points}
                />
              ) : null}

              {summary.negative_points.length > 0 ? (
                <SummaryPointList
                  title="부정 포인트"
                  icon={<FaRegThumbsDown size={14} aria-hidden />}
                  items={summary.negative_points}
                />
              ) : null}

              {summary.keywords.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <p
                    style={{
                      fontFamily: commerceTypography.fontFamily.body,
                      fontSize: commerceTypography.caption.md.regular.fontSize,
                      fontWeight: commerceTypography.fontWeight.semibold,
                      lineHeight: "22px",
                      color: commerceColors.text.secondary,
                    }}
                  >
                    키워드
                  </p>
                  <ul className="flex flex-wrap gap-2" aria-label="리뷰 키워드">
                    {summary.keywords.map((keyword) => (
                      <li
                        key={keyword}
                        className="rounded-full px-3 py-1"
                        style={{
                          backgroundColor: commerceColors.background.light,
                          color: commerceColors.text.secondary,
                          fontFamily: commerceTypography.fontFamily.body,
                          fontSize:
                            commerceTypography.caption.md.regular.fontSize,
                          fontWeight: commerceTypography.fontWeight.medium,
                          lineHeight: "20px",
                        }}
                      >
                        {keyword}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <p
              style={{
                fontFamily: commerceTypography.fontFamily.body,
                fontSize: commerceTypography.caption.md.regular.fontSize,
                fontWeight: commerceTypography.fontWeight.regular,
                lineHeight: "24px",
                color: commerceColors.text.tertiary,
              }}
            >
              아직 생성된 AI 리뷰 요약이 없습니다.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

type SummaryPointListProps = {
  title: string;
  icon: ReactNode;
  items: string[];
};

const SummaryPointList = ({ title, icon, items }: SummaryPointListProps) => {
  return (
    <div className="flex flex-col gap-2">
      <p
        className="flex items-center gap-2"
        style={{
          fontFamily: commerceTypography.fontFamily.body,
          fontSize: commerceTypography.caption.md.regular.fontSize,
          fontWeight: commerceTypography.fontWeight.semibold,
          lineHeight: "22px",
          color: commerceColors.text.secondary,
        }}
      >
        {icon}
        {title}
      </p>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li
            key={item}
            style={{
              fontFamily: commerceTypography.fontFamily.body,
              fontSize: commerceTypography.caption.md.regular.fontSize,
              fontWeight: commerceTypography.fontWeight.regular,
              lineHeight: "22px",
              color: commerceColors.text.tertiary,
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};
