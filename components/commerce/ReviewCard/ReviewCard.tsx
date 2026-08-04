"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type HTMLAttributes } from "react";
import { FaPen, FaTrash } from "react-icons/fa";
import {
  isAuthRequiredError,
  isForbiddenError,
  isNotFoundError,
} from "@/app/(commerce)/likes/errors";
import { deleteReview } from "@/app/(commerce)/products/[productId]/review-actions";
import { commerceColors } from "@/commons/constants/color";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { commerceTypography } from "@/commons/constants/typography";
import { AUTH_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";
import { toast } from "@/commons/utils/toast";
import { RatingStars } from "@/components/commerce/RatingStars/RatingStars";
import { ReviewEditForm } from "@/components/commerce/ReviewEditForm";
import { IconButton } from "@/components/ui/IconButton";

export interface ReviewCardProps extends HTMLAttributes<HTMLElement> {
  reviewId: string;
  productId: string;
  authorUserId: string;
  currentUserId?: string | null;
  authorName: string;
  avatarUrl?: string;
  rating: number;
  body: string;
}

export const ReviewCard = ({
  reviewId,
  productId,
  authorUserId,
  currentUserId,
  authorName,
  avatarUrl,
  rating,
  body,
  className,
  style,
  ...props
}: ReviewCardProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwnReview = Boolean(
    currentUserId && authorUserId && currentUserId === authorUserId,
  );

  const handleDelete = async () => {
    if (isDeleting) return;

    const confirmed = window.confirm("이 리뷰를 삭제하시겠습니까?");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteReview({ reviewId, productId });
      toast.success("리뷰가 삭제되었습니다.");
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products.all,
      });
      router.refresh();
    } catch (error) {
      if (isAuthRequiredError(error)) {
        toast.error("로그인이 필요합니다.");
        router.push(AUTH_URLS.LOGIN);
        return;
      }
      if (isForbiddenError(error)) {
        toast.error("본인의 리뷰만 삭제할 수 있습니다.");
        return;
      }
      if (isNotFoundError(error)) {
        toast.error("리뷰를 찾을 수 없습니다.");
        return;
      }
      toast.error(
        error instanceof Error ? error.message : "리뷰 삭제에 실패했습니다.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

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
        {isEditing ? (
          <ReviewEditForm
            reviewId={reviewId}
            productId={productId}
            initialRating={rating}
            initialContent={body}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => setIsEditing(false)}
          />
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-3">
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

              {isOwnReview ? (
                <div className="flex shrink-0 items-center gap-1">
                  <IconButton
                    aria-label="리뷰 수정"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => setIsEditing(true)}
                  >
                    <FaPen size={14} aria-hidden />
                  </IconButton>
                  <IconButton
                    aria-label="리뷰 삭제"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => {
                      void handleDelete();
                    }}
                  >
                    <FaTrash size={14} aria-hidden />
                  </IconButton>
                </div>
              ) : null}
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
          </>
        )}
      </div>
    </article>
  );
};
