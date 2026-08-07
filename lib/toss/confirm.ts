import { getServerEnv } from "@/commons/config/env";

export type TossConfirmRequest = {
  paymentKey: string;
  orderId: string;
  amount: number;
};

export type TossConfirmSuccess = {
  ok: true;
  payment: Record<string, unknown>;
};

export type TossConfirmFailure = {
  ok: false;
  code: string;
  message: string;
};

/**
 * 토스페이먼츠 결제 승인 API
 * @see https://docs.tosspayments.com/guides/v2/payment-window/integration
 */
export async function confirmTossPayment(
  params: TossConfirmRequest,
): Promise<TossConfirmSuccess | TossConfirmFailure> {
  const {
    tossPayments: { secretKey },
  } = getServerEnv();

  const auth = Buffer.from(`${secretKey}:`).toString("base64");
  const idempotencyKey = crypto.randomUUID();

  const response = await fetch(
    "https://api.tosspayments.com/v1/payments/confirm",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        paymentKey: params.paymentKey,
        orderId: params.orderId,
        amount: params.amount,
      }),
    },
  );

  const body = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    return {
      ok: false,
      code: typeof body.code === "string" ? body.code : "CONFIRM_FAILED",
      message:
        typeof body.message === "string"
          ? body.message
          : "결제 승인에 실패했습니다.",
    };
  }

  return { ok: true, payment: body };
}
