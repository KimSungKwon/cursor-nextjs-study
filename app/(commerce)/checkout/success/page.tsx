import Link from "next/link";
import { completeCheckoutPayment } from "@/app/(commerce)/checkout/actions";
import { ACCOUNT_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import { CheckoutResultClient } from "@/app/(commerce)/checkout/_components/CheckoutResultClient";

type SuccessSearchParams = {
  paymentKey?: string;
  orderId?: string;
  amount?: string;
  dbOrderId?: string;
};

type CheckoutSuccessPageProps = {
  searchParams: Promise<SuccessSearchParams>;
};

/**
 * 토스 결제 인증 성공 → 승인 API → orders/payments 성공 상태 반영
 */
const CheckoutSuccessPage = async ({
  searchParams,
}: CheckoutSuccessPageProps) => {
  const params = await searchParams;
  const paymentKey = params.paymentKey?.trim() ?? "";
  const tossOrderId = params.orderId?.trim() ?? "";
  const amountFromQuery = Number(params.amount);

  let resultPayload: Record<string, unknown>;

  if (!paymentKey || !tossOrderId || !Number.isFinite(amountFromQuery)) {
    resultPayload = {
      status: "error",
      error: "필수 결제 파라미터(paymentKey, orderId, amount)가 없습니다.",
      paymentKey: paymentKey || null,
      orderId: tossOrderId || null,
      amount: params.amount ?? null,
    };
  } else {
    const result = await completeCheckoutPayment({
      paymentKey,
      tossOrderId,
      amountFromQuery,
    });

    if (result.ok) {
      resultPayload = {
        status: "success",
        orderId: result.orderId,
        tossOrderId: result.tossOrderId,
        paymentKey: result.paymentKey,
        amount: result.amount,
        alreadyCompleted: result.alreadyCompleted ?? false,
        db: {
          orders: { status: "paid", payment_status: "success" },
          payments: { status: "succeeded" },
        },
      };
    } else {
      resultPayload = {
        status: "error",
        error: result.error,
        code: result.code ?? null,
        paymentKey,
        orderId: tossOrderId,
        amount: amountFromQuery,
      };
    }
  }

  const isSuccess = resultPayload.status === "success";

  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      {isSuccess ? <CheckoutResultClient clearOrderStorage /> : null}
      <h1
        className="text-[var(--commerce-text-primary)]"
        style={{
          fontFamily: "var(--commerce-headline-h4-font-family)",
          fontSize: "var(--commerce-headline-h4-font-size)",
          fontWeight: "var(--commerce-headline-h4-font-weight)",
          lineHeight: "44px",
        }}
      >
        {isSuccess ? "결제 완료" : "결제 처리 실패"}
      </h1>
      <p
        className="text-[var(--commerce-text-secondary)]"
        style={{
          fontFamily: "var(--commerce-font-family-body)",
          fontSize: "var(--commerce-body-md-regular-font-size)",
          lineHeight: "26px",
        }}
      >
        {isSuccess
          ? "결제가 승인되었고 주문/결제 상태가 갱신되었습니다."
          : "결제 승인 또는 상태 갱신에 실패했습니다."}
      </p>
      <pre
        className="overflow-x-auto rounded-md border border-[var(--commerce-border-light)] bg-[var(--commerce-background-light)] p-4 text-left text-sm text-[var(--commerce-text-primary)]"
        data-testid="checkout-success-json"
      >
        {JSON.stringify(resultPayload, null, 2)}
      </pre>
      <div className="flex flex-wrap gap-4">
        <Link
          href={isSuccess ? ACCOUNT_URLS.ORDERS : ACCOUNT_URLS.CHECKOUT}
          className="text-[var(--commerce-text-primary)] underline-offset-2 hover:underline"
        >
          {isSuccess ? "주문 내역 보기" : "다시 결제하기"}
        </Link>
        <Link
          href={COMMERCE_URLS.HOME}
          className="text-[var(--commerce-text-tertiary)] underline-offset-2 hover:underline"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
};

export default CheckoutSuccessPage;
