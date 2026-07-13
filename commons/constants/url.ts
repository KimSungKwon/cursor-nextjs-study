// Figma Commerce/Admin 템플릿 기반 URL 상수 (커머스 245-3108, 어드민 245-10962)

export type RouteAccess = "public" | "member" | "admin";

export interface RouteConfig {
  path: string;
  access: RouteAccess;
  dynamic?: boolean;
}

/** 인증 (Sign In / Sign Up) */
export const AUTH_URLS = {
  LOGIN: "/login",
  SIGNUP: "/signup",
} as const;

/** 회원 전용 — My Account + 결제 플로우 */
export const ACCOUNT_URLS = {
  ACCOUNT: "/account",
  ORDERS: "/account/orders",
  ORDER_DETAIL: (orderId: string) => `/account/orders/${orderId}`,
  REVIEWS: "/account/reviews",
  WISHLIST: "/account/wishlist",
  CHECKOUT: "/checkout",
  ORDER_COMPLETE: "/order-complete",
} as const;

/** 커머스 공개 페이지 */
export const COMMERCE_URLS = {
  HOME: "/",
  SHOP: "/products", // Figma Nav "Shop"
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (productId: string) => `/products/${productId}`,
  CART: "/cart",
  CONTACT: "/contact",
} as const;

/** 관리자 전용 */
export const ADMIN_URLS = {
  DASHBOARD: "/admin",
  ORDERS: "/admin/orders",
  ORDER_DETAIL: (orderId: string) => `/admin/orders/${orderId}`,
  CUSTOMERS: "/admin/customers",
  TRANSACTIONS: "/admin/transactions",
  TRANSACTION_DETAIL: (transactionId: string) =>
    `/admin/transactions/${transactionId}`,
  PRODUCTS: "/admin/products",
  PRODUCT_NEW: "/admin/products/new",
  PRODUCT_DETAIL: (productId: string) => `/admin/products/${productId}`,
  ADMINS: "/admin/admins",
  SETTINGS: "/admin/settings",
} as const;

/** 정적 경로 → 접근 권한 */
export const ROUTE_CONFIG_MAP = {
  [AUTH_URLS.LOGIN]: "public",
  [AUTH_URLS.SIGNUP]: "public",

  [COMMERCE_URLS.HOME]: "public",
  [COMMERCE_URLS.PRODUCTS]: "public",
  [COMMERCE_URLS.CART]: "public",
  [COMMERCE_URLS.CONTACT]: "public",

  [ACCOUNT_URLS.ACCOUNT]: "member",
  [ACCOUNT_URLS.ORDERS]: "member",
  [ACCOUNT_URLS.REVIEWS]: "member",
  [ACCOUNT_URLS.WISHLIST]: "member",
  [ACCOUNT_URLS.CHECKOUT]: "member",
  [ACCOUNT_URLS.ORDER_COMPLETE]: "member",

  [ADMIN_URLS.DASHBOARD]: "admin",
  [ADMIN_URLS.ORDERS]: "admin",
  [ADMIN_URLS.CUSTOMERS]: "admin",
  [ADMIN_URLS.TRANSACTIONS]: "admin",
  [ADMIN_URLS.PRODUCTS]: "admin",
  [ADMIN_URLS.PRODUCT_NEW]: "admin",
  [ADMIN_URLS.ADMINS]: "admin",
  [ADMIN_URLS.SETTINGS]: "admin",
} as const satisfies Record<string, RouteAccess>;

/**
 * pathname → 라우트 설정
 * 정적 경로를 먼저 찾고, 없으면 바로 위 부모 경로 권한을 상속한다.
 * 예: /products/abc → /products(public), /admin/orders/1 → /admin/orders(admin)
 */
export function getRouteConfig(pathname: string): RouteConfig | undefined {
  const access = ROUTE_CONFIG_MAP[pathname as keyof typeof ROUTE_CONFIG_MAP];
  if (access) return { path: pathname, access };

  const parentPath = pathname.replace(/\/[^/]+$/, "");
  const parentAccess =
    ROUTE_CONFIG_MAP[parentPath as keyof typeof ROUTE_CONFIG_MAP];
  if (parentAccess) return { path: pathname, access: parentAccess, dynamic: true };

  return undefined;
}
