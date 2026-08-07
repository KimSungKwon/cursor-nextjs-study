/** sessionStorage에 저장하는 체크아웃 주문 ID 키 */
export const CHECKOUT_ORDER_STORAGE_KEY = "checkout_order_id";

/**
 * 토스페이먼츠 orderId 생성 (6~64자, 영문·숫자·-_ )
 * @see https://docs.tosspayments.com/sdk/v2/js
 */
export function createTossOrderId(): string {
  const random = crypto.randomUUID().replace(/-/g, "");
  const id = `order_${Date.now()}_${random}`;
  return id.slice(0, 64);
}

/** 장바구니 상품명으로 토스 orderName 생성 */
export function buildOrderName(productNames: string[]): string {
  if (productNames.length === 0) {
    return "주문";
  }
  if (productNames.length === 1) {
    return productNames[0].slice(0, 100);
  }
  return `${productNames[0]} 외 ${productNames.length - 1}건`.slice(0, 100);
}

/** 토스 customerMobilePhone용 숫자만 추출 (10~11자리) */
export function normalizePhoneForToss(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** 토스 결제용 휴대폰 번호 유효성 (10~11자리 숫자) */
export function isValidTossPhone(phone: string): boolean {
  const digits = normalizePhoneForToss(phone);
  return digits.length >= 10 && digits.length <= 11;
}

export function saveCheckoutOrderId(orderId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CHECKOUT_ORDER_STORAGE_KEY, orderId);
}

export function loadCheckoutOrderId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(CHECKOUT_ORDER_STORAGE_KEY);
}

export function clearCheckoutOrderId(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CHECKOUT_ORDER_STORAGE_KEY);
}
