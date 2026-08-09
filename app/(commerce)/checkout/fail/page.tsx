import { CheckoutFailClient } from "@/app/(commerce)/checkout/fail/CheckoutFailClient";

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
 * 토스 결제 인증 실패 리다이렉트 → 클라이언트에서 실패 UI·DB 반영
 */
const CheckoutFailPage = async ({ searchParams }: CheckoutFailPageProps) => {
  const params = await searchParams;

  return (
    <CheckoutFailClient
      code={params.code}
      message={params.message}
      tossOrderId={params.orderId?.trim() || undefined}
      dbOrderId={params.dbOrderId?.trim() || undefined}
    />
  );
};

export default CheckoutFailPage;
