"use client";

import type { HTMLAttributes } from "react";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";
import { RatingStars } from "@/components/commerce/RatingStars/RatingStars";

export interface ReviewCardProps extends HTMLAttributes<HTMLElement> {
  authorName: string;
  avatarUrl?: string;
  rating: number;
  body: string;
}

export const ReviewCard = ({
  authorName,
  avatarUrl,
  rating,
  body,
  className,
  style,
  ...props
}: ReviewCardProps) => {
  return (
    <article
      className={cn("flex w-full max-w-[1120px] gap-7 pb-6", className)}
      style={{
        borderBottom: `1px solid ${commerceColors.border.light}`,
        fontFamily: commerceTypography.fontFamily.body,
        ...style,
      }}
      {...props}
    >
      <div
        className="size-[72px] shrink-0 overflow-hidden rounded-full"
        style={{ backgroundColor: commerceColors.background.light }}
        aria-hidden={!avatarUrl}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              color: commerceColors.text.tertiary,
              fontSize: commerceTypography.body.lg.semibold.fontSize,
              fontWeight: commerceTypography.fontWeight.semibold,
            }}
            aria-hidden
          >
            {authorName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-3">
          <h3
            style={{
              color: commerceColors.text.secondary,
              fontSize: commerceTypography.body.lg.semibold.fontSize,
              fontWeight: commerceTypography.fontWeight.semibold,
              lineHeight: "32px",
            }}
          >
            {authorName}
          </h3>
          <RatingStars value={rating} readOnly />
        </div>
        <p
          style={{
            color: commerceColors.primary.light,
            fontSize: commerceTypography.body.md.regular.fontSize,
            fontWeight: commerceTypography.fontWeight.regular,
            lineHeight: "26px",
          }}
        >
          {body}
        </p>
      </div>
    </article>
  );
};
