-- 커머스 대시보드 초기 스키마
-- auth.users 연동은 추후 추가 예정

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 사용자 권한 enum
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

COMMENT ON TYPE public.user_role IS '사용자 권한 (일반 사용자 / 관리자)';

-- ---------------------------------------------------------------------------
-- users: 앱 사용자 (auth.users 연동 전 독립 테이블)
-- ---------------------------------------------------------------------------
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  display_name text,
  role public.user_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS '앱 사용자 정보';
COMMENT ON COLUMN public.users.id IS '사용자 고유 ID';
COMMENT ON COLUMN public.users.email IS '로그인 이메일 (고유)';
COMMENT ON COLUMN public.users.display_name IS '표시 이름';
COMMENT ON COLUMN public.users.role IS '사용자 권한';
COMMENT ON COLUMN public.users.created_at IS '생성 일시';
COMMENT ON COLUMN public.users.updated_at IS '수정 일시';

CREATE INDEX idx_users_role ON public.users (role);

-- ---------------------------------------------------------------------------
-- products: 상품
-- ---------------------------------------------------------------------------
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  sale_price numeric,
  image_url text,
  status text NOT NULL DEFAULT 'registered',
  additional_info text,
  measurements text,
  categories text[],
  rating_average numeric,
  review_summary jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_price_non_negative CHECK (price >= 0),
  CONSTRAINT products_sale_price_non_negative CHECK (sale_price IS NULL OR sale_price >= 0),
  CONSTRAINT products_status_check CHECK (status IN ('registered', 'hidden', 'sold_out'))
);

COMMENT ON TABLE public.products IS '판매 상품 정보';
COMMENT ON COLUMN public.products.id IS '상품 고유 ID';
COMMENT ON COLUMN public.products.name IS '상품명';
COMMENT ON COLUMN public.products.description IS '상품 설명';
COMMENT ON COLUMN public.products.price IS '정가';
COMMENT ON COLUMN public.products.sale_price IS '할인가';
COMMENT ON COLUMN public.products.image_url IS '대표 이미지 URL';
COMMENT ON COLUMN public.products.status IS '판매 상태 (registered/hidden/sold_out)';
COMMENT ON COLUMN public.products.additional_info IS '추가 상품 정보';
COMMENT ON COLUMN public.products.measurements IS '사이즈/치수 정보';
COMMENT ON COLUMN public.products.categories IS '카테고리 목록';
COMMENT ON COLUMN public.products.rating_average IS '평균 평점';
COMMENT ON COLUMN public.products.review_summary IS '리뷰 요약 JSON';
COMMENT ON COLUMN public.products.created_at IS '생성 일시';
COMMENT ON COLUMN public.products.updated_at IS '수정 일시';

CREATE INDEX idx_products_status ON public.products (status);
CREATE INDEX idx_products_created_at ON public.products (created_at DESC);

-- ---------------------------------------------------------------------------
-- orders: 주문
-- ---------------------------------------------------------------------------
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  total_amount numeric NOT NULL DEFAULT 0,
  subtotal_amount numeric NOT NULL DEFAULT 0,
  shipping_fee numeric NOT NULL DEFAULT 0,
  discount_amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  payment_status text NOT NULL DEFAULT 'requested',
  contact_name text,
  contact_phone text,
  contact_email text,
  shipping_name text,
  shipping_phone text,
  shipping_address_line1 text,
  shipping_address_line2 text,
  shipping_city text,
  shipping_state text,
  shipping_zip text,
  shipping_country text,
  toss_order_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE RESTRICT,
  CONSTRAINT orders_status_check CHECK (status IN ('pending', 'paid', 'canceled', 'refunded')),
  CONSTRAINT orders_payment_status_check CHECK (
    payment_status IN ('requested', 'success', 'failed', 'refund_requested', 'refund_completed')
  ),
  CONSTRAINT orders_total_amount_non_negative CHECK (total_amount >= 0),
  CONSTRAINT orders_subtotal_amount_non_negative CHECK (subtotal_amount >= 0),
  CONSTRAINT orders_shipping_fee_non_negative CHECK (shipping_fee >= 0),
  CONSTRAINT orders_discount_amount_non_negative CHECK (discount_amount >= 0)
);

COMMENT ON TABLE public.orders IS '주문 정보';
COMMENT ON COLUMN public.orders.user_id IS '주문한 사용자 ID';
COMMENT ON COLUMN public.orders.status IS '주문 상태';
COMMENT ON COLUMN public.orders.total_amount IS '최종 결제 금액';
COMMENT ON COLUMN public.orders.subtotal_amount IS '상품 소계';
COMMENT ON COLUMN public.orders.shipping_fee IS '배송비';
COMMENT ON COLUMN public.orders.discount_amount IS '할인 금액';
COMMENT ON COLUMN public.orders.currency IS '결제 통화';
COMMENT ON COLUMN public.orders.payment_status IS '결제 처리 상태';
COMMENT ON COLUMN public.orders.toss_order_id IS '토스페이먼츠 주문 ID';
COMMENT ON COLUMN public.orders.paid_at IS '결제 완료 일시';

CREATE INDEX idx_orders_user_id ON public.orders (user_id);
CREATE INDEX idx_orders_status ON public.orders (status);
CREATE INDEX idx_orders_created_at ON public.orders (created_at DESC);

-- ---------------------------------------------------------------------------
-- order_items: 주문 상품 항목
-- ---------------------------------------------------------------------------
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  unit_sale_price numeric,
  product_name text,
  product_image_url text,
  line_subtotal numeric NOT NULL DEFAULT 0,
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders (id) ON DELETE CASCADE,
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products (id) ON DELETE RESTRICT,
  CONSTRAINT order_items_quantity_positive CHECK (quantity > 0),
  CONSTRAINT order_items_unit_price_non_negative CHECK (unit_price >= 0),
  CONSTRAINT order_items_unit_sale_price_non_negative CHECK (unit_sale_price IS NULL OR unit_sale_price >= 0),
  CONSTRAINT order_items_line_subtotal_non_negative CHECK (line_subtotal >= 0)
);

COMMENT ON TABLE public.order_items IS '주문에 포함된 상품 항목';
COMMENT ON COLUMN public.order_items.order_id IS '주문 ID';
COMMENT ON COLUMN public.order_items.product_id IS '상품 ID';
COMMENT ON COLUMN public.order_items.quantity IS '주문 수량';
COMMENT ON COLUMN public.order_items.unit_price IS '주문 시점 정가';
COMMENT ON COLUMN public.order_items.unit_sale_price IS '주문 시점 할인가';
COMMENT ON COLUMN public.order_items.product_name IS '주문 시점 상품명 스냅샷';
COMMENT ON COLUMN public.order_items.product_image_url IS '주문 시점 상품 이미지 스냅샷';
COMMENT ON COLUMN public.order_items.line_subtotal IS '항목 소계';

CREATE INDEX idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items (product_id);

-- ---------------------------------------------------------------------------
-- payments: 결제
-- ---------------------------------------------------------------------------
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  user_id uuid NOT NULL,
  provider text NOT NULL DEFAULT 'mock',
  method text NOT NULL DEFAULT 'card',
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending',
  transaction_id text,
  payment_key text,
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders (id) ON DELETE CASCADE,
  CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE RESTRICT,
  CONSTRAINT payments_amount_non_negative CHECK (amount >= 0),
  CONSTRAINT payments_status_check CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled'))
);

COMMENT ON TABLE public.payments IS '결제 트랜잭션';
COMMENT ON COLUMN public.payments.order_id IS '연결된 주문 ID';
COMMENT ON COLUMN public.payments.user_id IS '결제한 사용자 ID';
COMMENT ON COLUMN public.payments.provider IS '결제 제공자';
COMMENT ON COLUMN public.payments.method IS '결제 수단';
COMMENT ON COLUMN public.payments.amount IS '결제 금액';
COMMENT ON COLUMN public.payments.status IS '결제 상태';
COMMENT ON COLUMN public.payments.transaction_id IS '외부 거래 ID';
COMMENT ON COLUMN public.payments.payment_key IS '결제 키';
COMMENT ON COLUMN public.payments.raw_payload IS '결제사 원본 응답';

CREATE INDEX idx_payments_order_id ON public.payments (order_id);
CREATE INDEX idx_payments_user_id ON public.payments (user_id);
CREATE INDEX idx_payments_status ON public.payments (status);

-- ---------------------------------------------------------------------------
-- reviews: 상품 리뷰
-- ---------------------------------------------------------------------------
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  rating integer NOT NULL,
  content text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE,
  CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products (id) ON DELETE CASCADE,
  CONSTRAINT reviews_rating_range CHECK (rating >= 1 AND rating <= 5)
);

COMMENT ON TABLE public.reviews IS '상품 리뷰';
COMMENT ON COLUMN public.reviews.user_id IS '작성자 ID';
COMMENT ON COLUMN public.reviews.product_id IS '리뷰 대상 상품 ID';
COMMENT ON COLUMN public.reviews.rating IS '평점 (1~5)';
COMMENT ON COLUMN public.reviews.content IS '리뷰 내용';

CREATE INDEX idx_reviews_product_id ON public.reviews (product_id);
CREATE INDEX idx_reviews_user_id ON public.reviews (user_id);

-- ---------------------------------------------------------------------------
-- cart_items: 장바구니
-- ---------------------------------------------------------------------------
CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE,
  CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products (id) ON DELETE CASCADE,
  CONSTRAINT cart_items_quantity_positive CHECK (quantity > 0)
);

COMMENT ON TABLE public.cart_items IS '사용자 장바구니 항목';
COMMENT ON COLUMN public.cart_items.user_id IS '사용자 ID (추후 auth.users.id 연동 예정)';
COMMENT ON COLUMN public.cart_items.product_id IS '상품 ID';
COMMENT ON COLUMN public.cart_items.quantity IS '담은 수량';

CREATE INDEX idx_cart_items_user_id ON public.cart_items (user_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items (product_id);

-- ---------------------------------------------------------------------------
-- like_items: 찜 목록
-- ---------------------------------------------------------------------------
CREATE TABLE public.like_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT like_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE,
  CONSTRAINT like_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products (id) ON DELETE CASCADE,
  CONSTRAINT like_items_user_product_unique UNIQUE (user_id, product_id)
);

COMMENT ON TABLE public.like_items IS '사용자 찜(좋아요) 목록';
COMMENT ON COLUMN public.like_items.user_id IS '사용자 ID';
COMMENT ON COLUMN public.like_items.product_id IS '찜한 상품 ID';

CREATE INDEX idx_like_items_user_id ON public.like_items (user_id);
CREATE INDEX idx_like_items_product_id ON public.like_items (product_id);

-- ---------------------------------------------------------------------------
-- mcp_settings: MCP 연동 설정
-- ---------------------------------------------------------------------------
CREATE TABLE public.mcp_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slack_enabled boolean NOT NULL DEFAULT false,
  notion_enabled boolean NOT NULL DEFAULT false,
  notion_url text,
  notion_report_per_payment boolean NOT NULL DEFAULT false,
  notion_report_monthly_manual boolean NOT NULL DEFAULT false,
  notion_report_monthly_auto boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.mcp_settings IS 'Slack/Notion MCP 연동 설정';
COMMENT ON COLUMN public.mcp_settings.slack_enabled IS 'Slack 연동 활성화 여부';
COMMENT ON COLUMN public.mcp_settings.notion_enabled IS 'Notion 연동 활성화 여부';
COMMENT ON COLUMN public.mcp_settings.notion_url IS 'Notion 페이지 URL';
COMMENT ON COLUMN public.mcp_settings.notion_report_per_payment IS '결제마다 Notion 리포트 생성 여부';
COMMENT ON COLUMN public.mcp_settings.notion_report_monthly_manual IS '월간 수동 리포트 여부';
COMMENT ON COLUMN public.mcp_settings.notion_report_monthly_auto IS '월간 자동 리포트 여부';
