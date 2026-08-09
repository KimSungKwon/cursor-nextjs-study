"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import { failCheckoutPayment } from "@/app/(commerce)/checkout/actions";
import { CheckoutProgress } from "@/app/(commerce)/checkout/_components/CheckoutProgress";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS, COMMERCE_URLS } from "@/commons/constants/url";

export type CheckoutFailClientProps = {
  code?: string;
  message?: string;
  tossOrderId?: string;
  dbOrderId?: string;
};

type ViewState =
  | { status: "loading" }
  | {
      status: "ready";
      orderId: string | null;
      tossOrderId: string | null;
      dbUpdated: boolean;
      error?: string;
    };

const pillLinkClass =
  "inline-flex h-[52px] min-w-[160px] items-center justify-center rounded-full px-8 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2";

/**
 * 결제 인증 실패 UI (Order Complete 카드 레이아웃 기반)
 */
export function CheckoutFailClient({
  code,
  message,
  tossOrderId,
  dbOrderId,
}: CheckoutFailClientProps) {
  const [view, setView] = useState<ViewState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!tossOrderId && !dbOrderId) {
        if (!cancelled) {
          setView({
            status: "ready",
            orderId: null,
            tossOrderId: null,
            dbUpdated: false,
            error: "주문 식별자가 없어 DB 상태를 갱신하지 않았습니다.",
          });
        }
        return;
      }

      const result = await failCheckoutPayment({
        tossOrderId,
        dbOrderId,
        code,
        message,
      });

      if (cancelled) return;

      if (result.ok) {
        setView({
          status: "ready",
          orderId: result.orderId,
          tossOrderId: result.tossOrderId,
          dbUpdated: true,
        });
        return;
      }

      setView({
        status: "ready",
        orderId: dbOrderId ?? null,
        tossOrderId: tossOrderId ?? null,
        dbUpdated: false,
        error: result.error,
      });
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [code, message, tossOrderId, dbOrderId]);

  const displayMessage =
    message?.trim() ||
    "결제 인증에 실패했거나 취소되었습니다. 다시 시도해 주세요.";

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 py-10 sm:px-6 lg:px-10 xl:px-40">
      <div className="mx-auto flex w-full max-w-[832px] flex-col items-center gap-10">
        <header className="flex w-full flex-col items-center gap-10">
          <h1
            className="text-center"
            style={{
              fontFamily: commerceTypography.headline.h3.fontFamily,
              fontSize: commerceTypography.headline.h3.fontSize,
              fontWeight: commerceTypography.headline.h3.fontWeight,
              lineHeight: "58px",
              letterSpacing: "-1px",
              color: commerceColors.text.primary,
            }}
          >
            Incomplete
          </h1>
          <CheckoutProgress current="checkout" />
        </header>

        <section
          className="flex w-full max-w-[738px] flex-col items-center gap-10 rounded-lg px-6 py-16 sm:px-24"
          style={{
            backgroundColor: commerceColors.background.default,
            boxShadow: "0 8px 40px rgba(20, 23, 24, 0.08)",
          }}
          role="alert"
          aria-labelledby="payment-fail-heading"
          aria-busy={view.status === "loading"}
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <HiOutlineExclamationTriangle
              size={40}
              color={commerceColors.semantic.error}
              aria-hidden
            />
            <p
              style={{
                fontFamily: commerceTypography.headline.h6.fontFamily,
                fontSize: commerceTypography.headline.h6.fontSize,
                fontWeight: commerceTypography.headline.h6.fontWeight,
                lineHeight: "34px",
                letterSpacing: "-0.6px",
                color: commerceColors.text.tertiary,
              }}
            >
              Payment failed
            </p>
            <h2
              id="payment-fail-heading"
              style={{
                fontFamily: commerceTypography.headline.h4.fontFamily,
                fontSize: commerceTypography.headline.h4.fontSize,
                fontWeight: commerceTypography.headline.h4.fontWeight,
                lineHeight: "44px",
                letterSpacing: "-0.4px",
                color: commerceColors.neutral.n06,
              }}
            >
              Your payment was not completed
            </h2>
            <p
              style={{
                fontFamily: commerceTypography.fontFamily.body,
                fontSize: commerceTypography.body.md.regular.fontSize,
                lineHeight: "26px",
                color: commerceColors.text.tertiary,
              }}
            >
              {displayMessage}
            </p>
          </div>

          {view.status === "loading" ? (
            <p
              style={{
                fontFamily: commerceTypography.fontFamily.body,
                fontSize: commerceTypography.caption.md.regular.fontSize,
                lineHeight: "22px",
                color: commerceColors.text.tertiary,
              }}
            >
              주문 상태를 갱신하는 중…
            </p>
          ) : (
            <dl className="grid w-full max-w-[548px] grid-cols-[auto_1fr] gap-x-8 gap-y-5">
              {(
                [
                  ["Error code:", code?.trim() || "—"],
                  [
                    "Order ID:",
                    view.tossOrderId || view.orderId || "—",
                  ],
                  ...(view.error
                    ? ([["DB update:", view.error]] as const)
                    : ([
                        [
                          "DB update:",
                          view.dbUpdated ? "payment_status=failed" : "skipped",
                        ],
                      ] as const)),
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="contents">
                  <dt
                    style={{
                      fontFamily: commerceTypography.fontFamily.body,
                      fontSize: commerceTypography.caption.md.semibold.fontSize,
                      fontWeight: commerceTypography.fontWeight.semibold,
                      lineHeight: "22px",
                      color: commerceColors.text.tertiary,
                    }}
                  >
                    {label}
                  </dt>
                  <dd
                    className="break-all"
                    style={{
                      fontFamily: commerceTypography.fontFamily.body,
                      fontSize: commerceTypography.caption.md.semibold.fontSize,
                      fontWeight: commerceTypography.fontWeight.semibold,
                      lineHeight: "22px",
                      color: commerceColors.text.secondary,
                    }}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={ACCOUNT_URLS.CHECKOUT}
              className={pillLinkClass}
              style={{
                fontFamily: commerceTypography.fontFamily.body,
                fontSize: commerceTypography.button.sm.fontSize,
                fontWeight: commerceTypography.fontWeight.medium,
                lineHeight: "28px",
                letterSpacing: "-0.4px",
                backgroundColor: commerceColors.primary.main,
                color: commerceColors.text.inverse,
                outlineColor: commerceColors.primary.main,
              }}
            >
              Try again
            </Link>
            <Link
              href={COMMERCE_URLS.CART}
              className={pillLinkClass}
              style={{
                fontFamily: commerceTypography.fontFamily.body,
                fontSize: commerceTypography.button.sm.fontSize,
                fontWeight: commerceTypography.fontWeight.medium,
                lineHeight: "28px",
                letterSpacing: "-0.4px",
                backgroundColor: "transparent",
                color: commerceColors.text.secondary,
                border: `1px solid ${commerceColors.primary.main}`,
                outlineColor: commerceColors.primary.main,
              }}
            >
              Back to cart
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
