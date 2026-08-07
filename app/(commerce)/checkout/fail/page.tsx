import Link from "next/link";
import { failCheckoutPayment } from "@/app/(commerce)/checkout/actions";
import { ACCOUNT_URLS, COMMERCE_URLS } from "@/commons/constants/url";

type FailSearchParams = {
  code?: string;
  message?: string;
  orderId?: string;
  dbOrderId?: string;
};

type CheckoutFailPageProps = {
  searchParams: Promise<FailSearchParams>;
};

/**
 * 토스 결제 인증 실패 → orders/payments failed 상태 반영
 */
const CheckoutFailPage = async ({ searchParams }: CheckoutFailPageProps) => {
  const params = await searchParams;
  const tossOrderId = params.orderId?.trim() || undefined;
  const dbOrderId = params.dbOrderId?.trim() || undefined;

  let resultPayload: Record<string, unknown> = {
    status: "fail",
    code: params.code ?? null,
    message: params.message ?? null,
    orderId: tossOrderId ?? null,
    dbOrderId: dbOrderId ?? null,
  };

  if (tossOrderId || dbOrderId) {
    const result = await failCheckoutPayment({
      tossOrderId,
      dbOrderId,
      code: params.code,
      message: params.message,
    });

    if (result.ok) {
      resultPayload = {
        ...resultPayload,
        dbUpdated: true,
        skipped: result.skipped ?? false,
        orderId: result.orderId,
        tossOrderId: result.tossOrderId,
        db: {
          orders: { payment_status: "failed" },
          payments: { status: "failed" },
        },
      };
    } else {
      resultPayload = {
        ...resultPayload,
        dbUpdated: false,
        error: result.error,
      };
    }
  } else {
    resultPayload = {
      ...resultPayload,
      dbUpdated: false,
      error: "주문 식별자가 없어 DB 상태를 갱신하지 않았습니다.",
    };
  }

  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <h1
        className="text-[var(--commerce-text-primary)]"
        style={{
          fontFamily: "var(--commerce-headline-h4-font-family)",
          fontSize: "var(--commerce-headline-h4-font-size)",
          fontWeight: "var(--commerce-headline-h4-font-weight)",
          lineHeight: "44px",
        }}
      >
        결제 인증 실패
      </h1>
      <p
        className="text-[var(--commerce-text-secondary)]"
        style={{
          fontFamily: "var(--commerce-font-family-body)",
          fontSize: "var(--commerce-body-md-regular-font-size)",
          lineHeight: "26px",
        }}
      >
        결제 인증에 실패했거나 취소되었습니다. 주문/결제 상태를 실패로
        반영했습니다.
      </p>
      <pre
        className="overflow-x-auto rounded-md border border-[var(--commerce-border-light)] bg-[var(--commerce-background-light)] p-4 text-left text-sm text-[var(--commerce-text-primary)]"
        data-testid="checkout-fail-json"
      >
        {JSON.stringify(resultPayload, null, 2)}
      </pre>
      <div className="flex flex-wrap gap-4">
        <Link
          href={ACCOUNT_URLS.CHECKOUT}
          className="text-[var(--commerce-text-primary)] underline-offset-2 hover:underline"
        >
          다시 결제하기
        </Link>
        <Link
          href={COMMERCE_URLS.CART}
          className="text-[var(--commerce-text-tertiary)] underline-offset-2 hover:underline"
        >
          장바구니로
        </Link>
      </div>
    </main>
  );
};

export default CheckoutFailPage;
