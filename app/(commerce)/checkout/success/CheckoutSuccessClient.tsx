"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  completeCheckoutPayment,
  type CompletePaymentResult,
} from "@/app/(commerce)/checkout/actions";
import { CheckoutProgress } from "@/app/(commerce)/checkout/_components/CheckoutProgress";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import { clearCheckoutOrderId } from "@/commons/utils/order";

export type CheckoutSuccessClientProps = {
  paymentKey: string;
  tossOrderId: string;
  amount: string;
};

type ViewState =
  | { status: "loading" }
  | { status: "success"; data: Extract<CompletePaymentResult, { ok: true }> }
  | { status: "error"; message: string; code?: string };

function formatOrderCode(orderId: string): string {
  const compact = orderId.replace(/-/g, "").slice(0, 10);
  return `#${compact.slice(0, 4)}_${compact.slice(4)}`;
}

function formatPaidDate(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatAmountKrw(amount: number): string {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

const pillLinkClass =
  "inline-flex h-[52px] min-w-[203px] items-center justify-center rounded-full px-10 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2";

/**
 * Figma Order Complete (61:11644) — 결제 승인 후 완료 UI
 */
export function CheckoutSuccessClient({
  paymentKey,
  tossOrderId,
  amount,
}: CheckoutSuccessClientProps) {
  const [view, setView] = useState<ViewState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const amountFromQuery = Number(amount);

    async function run() {
      if (!paymentKey || !tossOrderId || !Number.isFinite(amountFromQuery)) {
        if (!cancelled) {
          setView({
            status: "error",
            message: "필수 결제 파라미터(paymentKey, orderId, amount)가 없습니다.",
          });
        }
        return;
      }

      const result = await completeCheckoutPayment({
        paymentKey,
        tossOrderId,
        amountFromQuery,
      });

      if (cancelled) return;

      if (result.ok) {
        clearCheckoutOrderId();
        setView({ status: "success", data: result });
        return;
      }

      setView({
        status: "error",
        message: result.error,
        code: result.code,
      });
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [paymentKey, tossOrderId, amount]);

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
            {view.status === "error" ? "Incomplete" : "Complete!"}
          </h1>
          <CheckoutProgress
            current={view.status === "success" ? "complete" : "checkout"}
          />
        </header>

        {view.status === "loading" ? (
          <section
            className="flex w-full max-w-[738px] flex-col items-center gap-6 rounded-lg px-6 py-16 sm:px-24"
            style={{
              backgroundColor: commerceColors.background.default,
              boxShadow: "0 8px 40px rgba(20, 23, 24, 0.08)",
            }}
            aria-busy
            aria-live="polite"
          >
            <span
              className="size-10 animate-spin rounded-full border-2 border-r-transparent"
              style={{ borderColor: commerceColors.primary.main }}
              aria-hidden
            />
            <p
              style={{
                fontFamily: commerceTypography.fontFamily.body,
                fontSize: commerceTypography.body.md.regular.fontSize,
                lineHeight: "26px",
                color: commerceColors.text.tertiary,
              }}
            >
              결제를 확인하고 있습니다…
            </p>
          </section>
        ) : null}

        {view.status === "success" ? (
          <section
            className="flex w-full max-w-[738px] flex-col items-center gap-10 rounded-lg px-6 py-16 sm:px-24"
            style={{
              backgroundColor: commerceColors.background.default,
              boxShadow: "0 8px 40px rgba(20, 23, 24, 0.08)",
            }}
            aria-labelledby="order-complete-heading"
          >
            <div className="flex w-full max-w-[546px] flex-col items-center gap-4 text-center">
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
                Thank you! 🎉
              </p>
              <h2
                id="order-complete-heading"
                style={{
                  fontFamily: commerceTypography.headline.h4.fontFamily,
                  fontSize: commerceTypography.headline.h4.fontSize,
                  fontWeight: commerceTypography.headline.h4.fontWeight,
                  lineHeight: "44px",
                  letterSpacing: "-0.4px",
                  color: commerceColors.neutral.n06,
                }}
              >
                Your order has been received
              </h2>
            </div>

            <dl className="grid w-full max-w-[548px] grid-cols-[auto_1fr] gap-x-8 gap-y-5">
              {(
                [
                  ["Order code:", formatOrderCode(view.data.orderId)],
                  ["Date:", formatPaidDate(view.data.paidAt)],
                  ["Total:", formatAmountKrw(view.data.amount)],
                  ["Payment method:", "Toss Payments"],
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

            <Link
              href={ACCOUNT_URLS.ORDERS}
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
              Purchase history
            </Link>
          </section>
        ) : null}

        {view.status === "error" ? (
          <section
            className="flex w-full max-w-[738px] flex-col items-center gap-8 rounded-lg px-6 py-16 sm:px-24"
            style={{
              backgroundColor: commerceColors.background.default,
              boxShadow: "0 8px 40px rgba(20, 23, 24, 0.08)",
            }}
            role="alert"
            aria-labelledby="order-error-heading"
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <p
                style={{
                  fontFamily: commerceTypography.headline.h6.fontFamily,
                  fontSize: commerceTypography.headline.h6.fontSize,
                  fontWeight: commerceTypography.headline.h6.fontWeight,
                  lineHeight: "34px",
                  color: commerceColors.semantic.error,
                }}
              >
                Payment error
              </p>
              <h2
                id="order-error-heading"
                style={{
                  fontFamily: commerceTypography.headline.h4.fontFamily,
                  fontSize: commerceTypography.headline.h4.fontSize,
                  fontWeight: commerceTypography.headline.h4.fontWeight,
                  lineHeight: "44px",
                  letterSpacing: "-0.4px",
                  color: commerceColors.neutral.n06,
                }}
              >
                We couldn&apos;t complete your payment
              </h2>
              <p
                style={{
                  fontFamily: commerceTypography.fontFamily.body,
                  fontSize: commerceTypography.body.md.regular.fontSize,
                  lineHeight: "26px",
                  color: commerceColors.text.tertiary,
                }}
              >
                {view.message}
                {view.code ? ` (${view.code})` : ""}
              </p>
            </div>

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
                href={COMMERCE_URLS.HOME}
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
                Continue shopping
              </Link>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
