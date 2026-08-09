import { CheckoutSuccessClient } from "@/app/(commerce)/checkout/success/CheckoutSuccessClient";

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
 * 토스 결제 인증 성공 리다이렉트 → 클라이언트에서 승인·완료 UI 처리
 */
const CheckoutSuccessPage = async ({
  searchParams,
}: CheckoutSuccessPageProps) => {
  const params = await searchParams;

  return (
    <CheckoutSuccessClient
      paymentKey={params.paymentKey?.trim() ?? ""}
      tossOrderId={params.orderId?.trim() ?? ""}
      amount={params.amount?.trim() ?? ""}
    />
  );
};

export default CheckoutSuccessPage;
