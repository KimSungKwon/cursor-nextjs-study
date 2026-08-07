"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const TOSS_SDK_URL = "https://js.tosspayments.com/v2/standard";

type TossAmount = {
  currency: "KRW";
  value: number;
};

type TossPaymentInstance = {
  requestPayment: (params: {
    method: "CARD";
    amount: TossAmount;
    orderId: string;
    orderName: string;
    successUrl: string;
    failUrl: string;
    customerEmail?: string;
    customerName?: string;
    customerMobilePhone?: string;
    card?: {
      useEscrow: boolean;
      flowMode: "DEFAULT" | "DIRECT";
      useCardPoint: boolean;
      useAppCardOnly: boolean;
    };
  }) => Promise<void>;
};

type TossPaymentsSDK = {
  payment: (options: { customerKey: string }) => TossPaymentInstance;
};

type TossPaymentsFactory = (clientKey: string) => TossPaymentsSDK;

declare global {
  interface Window {
    TossPayments?: TossPaymentsFactory;
  }
}

export type TossRequestPaymentParams = {
  orderId: string;
  orderName: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerMobilePhone: string;
  successUrl: string;
  failUrl: string;
};

export type TossPaymentHandle = {
  requestPayment: (params: TossRequestPaymentParams) => Promise<void>;
  ready: boolean;
};

export type TossPaymentProps = {
  customerKey: string;
  clientKey: string;
};

function loadTossPaymentsScript(): Promise<TossPaymentsFactory> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("브라우저 환경에서만 SDK를 로드할 수 있습니다."));
  }

  if (window.TossPayments) {
    return Promise.resolve(window.TossPayments);
  }

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${TOSS_SDK_URL}"]`,
  );

  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => {
        if (window.TossPayments) resolve(window.TossPayments);
        else reject(new Error("TossPayments SDK 로드에 실패했습니다."));
      });
      existing.addEventListener("error", () => {
        reject(new Error("TossPayments SDK 스크립트 로드에 실패했습니다."));
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TOSS_SDK_URL;
    script.async = true;
    script.onload = () => {
      if (window.TossPayments) resolve(window.TossPayments);
      else reject(new Error("TossPayments SDK 로드에 실패했습니다."));
    };
    script.onerror = () => {
      reject(new Error("TossPayments SDK 스크립트 로드에 실패했습니다."));
    };
    document.head.appendChild(script);
  });
}

/**
 * 토스페이먼츠 결제창 SDK 래퍼
 * - 스크립트 동적 로드 후 payment 인스턴스 초기화
 * - ref.requestPayment로 외부에서 결제창 호출
 */
export const TossPayment = forwardRef<TossPaymentHandle, TossPaymentProps>(
  function TossPayment({ customerKey, clientKey }, ref) {
    const paymentRef = useRef<TossPaymentInstance | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
      let cancelled = false;

      async function init() {
        try {
          const TossPayments = await loadTossPaymentsScript();
          if (cancelled) return;

          // SDK: TossPayments(clientKey) → payment({ customerKey })
          const tossPayments = TossPayments(clientKey);
          paymentRef.current = tossPayments.payment({ customerKey });
          setReady(true);
        } catch (error) {
          console.error(error);
          if (!cancelled) {
            paymentRef.current = null;
            setReady(false);
          }
        }
      }

      void init();

      return () => {
        cancelled = true;
      };
    }, [clientKey, customerKey]);

    useImperativeHandle(
      ref,
      () => ({
        ready,
        async requestPayment(params: TossRequestPaymentParams) {
          if (!paymentRef.current) {
            throw new Error("결제 모듈이 아직 준비되지 않았습니다.");
          }

          const amountValue = Math.round(params.amount);
          if (!Number.isFinite(amountValue) || amountValue <= 0) {
            throw new Error("결제 금액이 올바르지 않습니다.");
          }

          await paymentRef.current.requestPayment({
            method: "CARD",
            amount: {
              currency: "KRW",
              value: amountValue,
            },
            orderId: params.orderId,
            orderName: params.orderName,
            successUrl: params.successUrl,
            failUrl: params.failUrl,
            customerEmail: params.customerEmail,
            customerName: params.customerName,
            customerMobilePhone: params.customerMobilePhone,
            card: {
              useEscrow: false,
              flowMode: "DEFAULT",
              useCardPoint: false,
              useAppCardOnly: false,
            },
          });
        },
      }),
      [ready],
    );

    return null;
  },
);
