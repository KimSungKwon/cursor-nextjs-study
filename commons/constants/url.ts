// Figma Commerce/Admin 템플릿 기반 URL 상수 (커머스 245-3108, 어드민 245-10962)

export type RouteAccess = "public" | "member" | "admin";

export interface RouteConfig {
  path: string;
  access: RouteAccess;
  /** 동적 세그먼트 포함 여부 (/products/[productId] 등) */
  dynamic?: boolean;
}

/** 동적 라우트 경로 템플릿 (ROUTE_CONFIG_MAP · DYNAMIC_PATTERNS 공용) */
export const DYNAMIC_ROUTE_PATHS = {
  PRODUCT_DETAIL: "/products/[productId]",
  ACCOUNT_ORDER_DETAIL: "/account/orders/[orderId]",
  ADMIN_ORDER_DETAIL: "/admin/orders/[orderId]",
  ADMIN_TRANSACTION_DETAIL: "/admin/transactions/[transactionId]",
  ADMIN_PRODUCT_DETAIL: "/admin/products/[productId]",
} as const;

/** 인증 (Sign In / Sign Up) */
export const AUTH_URLS = {
  LOGIN: "/login",
  SIGNUP: "/signup",
} as const;

/** 회원 전용 — My Account + 결제 플로우 */
export const ACCOUNT_URLS = {
  ACCOUNT: "/account",
  ORDERS: "/account/orders",
  ORDER_DETAIL: (orderId: string): `/account/orders/${string}` =>
    `/account/orders/${orderId}`,
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
  PRODUCT_DETAIL: (productId: string): `/products/${string}` =>
    `/products/${productId}`,
  CART: "/cart",
  CONTACT: "/contact",
} as const;

/** 관리자 전용 */
export const ADMIN_URLS = {
  DASHBOARD: "/admin",
  ORDERS: "/admin/orders",
  ORDER_DETAIL: (orderId: string): `/admin/orders/${string}` =>
    `/admin/orders/${orderId}`,
  CUSTOMERS: "/admin/customers",
  TRANSACTIONS: "/admin/transactions",
  TRANSACTION_DETAIL: (
    transactionId: string,
  ): `/admin/transactions/${string}` => `/admin/transactions/${transactionId}`,
  PRODUCTS: "/admin/products",
  PRODUCT_NEW: "/admin/products/new",
  PRODUCT_DETAIL: (productId: string): `/admin/products/${string}` =>
    `/admin/products/${productId}`,
  ADMINS: "/admin/admins",
  SETTINGS: "/admin/settings",
} as const;

/** path → 접근 권한 매핑 */
export const ROUTE_CONFIG_MAP = {
  [AUTH_URLS.LOGIN]: { path: AUTH_URLS.LOGIN, access: "public" },
  [AUTH_URLS.SIGNUP]: { path: AUTH_URLS.SIGNUP, access: "public" },

  [COMMERCE_URLS.HOME]: { path: COMMERCE_URLS.HOME, access: "public" },
  [COMMERCE_URLS.PRODUCTS]: { path: COMMERCE_URLS.PRODUCTS, access: "public" },
  [DYNAMIC_ROUTE_PATHS.PRODUCT_DETAIL]: {
    path: DYNAMIC_ROUTE_PATHS.PRODUCT_DETAIL,
    access: "public",
    dynamic: true,
  },
  [COMMERCE_URLS.CART]: { path: COMMERCE_URLS.CART, access: "public" },
  [COMMERCE_URLS.CONTACT]: { path: COMMERCE_URLS.CONTACT, access: "public" },

  [ACCOUNT_URLS.ACCOUNT]: { path: ACCOUNT_URLS.ACCOUNT, access: "member" },
  [ACCOUNT_URLS.ORDERS]: { path: ACCOUNT_URLS.ORDERS, access: "member" },
  [DYNAMIC_ROUTE_PATHS.ACCOUNT_ORDER_DETAIL]: {
    path: DYNAMIC_ROUTE_PATHS.ACCOUNT_ORDER_DETAIL,
    access: "member",
    dynamic: true,
  },
  [ACCOUNT_URLS.REVIEWS]: { path: ACCOUNT_URLS.REVIEWS, access: "member" },
  [ACCOUNT_URLS.WISHLIST]: { path: ACCOUNT_URLS.WISHLIST, access: "member" },
  [ACCOUNT_URLS.CHECKOUT]: { path: ACCOUNT_URLS.CHECKOUT, access: "member" },
  [ACCOUNT_URLS.ORDER_COMPLETE]: {
    path: ACCOUNT_URLS.ORDER_COMPLETE,
    access: "member",
  },

  [ADMIN_URLS.DASHBOARD]: { path: ADMIN_URLS.DASHBOARD, access: "admin" },
  [ADMIN_URLS.ORDERS]: { path: ADMIN_URLS.ORDERS, access: "admin" },
  [DYNAMIC_ROUTE_PATHS.ADMIN_ORDER_DETAIL]: {
    path: DYNAMIC_ROUTE_PATHS.ADMIN_ORDER_DETAIL,
    access: "admin",
    dynamic: true,
  },
  [ADMIN_URLS.CUSTOMERS]: { path: ADMIN_URLS.CUSTOMERS, access: "admin" },
  [ADMIN_URLS.TRANSACTIONS]: {
    path: ADMIN_URLS.TRANSACTIONS,
    access: "admin",
  },
  [DYNAMIC_ROUTE_PATHS.ADMIN_TRANSACTION_DETAIL]: {
    path: DYNAMIC_ROUTE_PATHS.ADMIN_TRANSACTION_DETAIL,
    access: "admin",
    dynamic: true,
  },
  [ADMIN_URLS.PRODUCTS]: { path: ADMIN_URLS.PRODUCTS, access: "admin" },
  [ADMIN_URLS.PRODUCT_NEW]: { path: ADMIN_URLS.PRODUCT_NEW, access: "admin" },
  [DYNAMIC_ROUTE_PATHS.ADMIN_PRODUCT_DETAIL]: {
    path: DYNAMIC_ROUTE_PATHS.ADMIN_PRODUCT_DETAIL,
    access: "admin",
    dynamic: true,
  },
  [ADMIN_URLS.ADMINS]: { path: ADMIN_URLS.ADMINS, access: "admin" },
  [ADMIN_URLS.SETTINGS]: { path: ADMIN_URLS.SETTINGS, access: "admin" },
} as const satisfies Record<string, RouteConfig>;

/** 동적 경로 매칭 (/admin/products/new 는 정적 PRODUCT_NEW 우선) */
const DYNAMIC_PATTERNS: {
  pattern: RegExp;
  configKey: (typeof DYNAMIC_ROUTE_PATHS)[keyof typeof DYNAMIC_ROUTE_PATHS];
}[] = [
  {
    pattern: /^\/products\/[^/]+$/,
    configKey: DYNAMIC_ROUTE_PATHS.PRODUCT_DETAIL,
  },
  {
    pattern: /^\/account\/orders\/[^/]+$/,
    configKey: DYNAMIC_ROUTE_PATHS.ACCOUNT_ORDER_DETAIL,
  },
  {
    pattern: /^\/admin\/orders\/[^/]+$/,
    configKey: DYNAMIC_ROUTE_PATHS.ADMIN_ORDER_DETAIL,
  },
  {
    pattern: /^\/admin\/transactions\/[^/]+$/,
    configKey: DYNAMIC_ROUTE_PATHS.ADMIN_TRANSACTION_DETAIL,
  },
  {
    pattern: /^\/admin\/products\/(?!new$)[^/]+$/,
    configKey: DYNAMIC_ROUTE_PATHS.ADMIN_PRODUCT_DETAIL,
  },
];

/** pathname → 라우트 설정 (정적 우선, 이후 동적 매칭) */
export function getRouteConfig(pathname: string): RouteConfig | undefined {
  const staticConfig = ROUTE_CONFIG_MAP[pathname as keyof typeof ROUTE_CONFIG_MAP];
  if (staticConfig) return staticConfig;

  for (const { pattern, configKey } of DYNAMIC_PATTERNS) {
    if (pattern.test(pathname)) return ROUTE_CONFIG_MAP[configKey];
  }

  return undefined;
}
