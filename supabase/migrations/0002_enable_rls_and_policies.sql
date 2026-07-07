-- Row Level Security(RLS) 활성화 및 정책 설정
-- 원칙: 최소 권한, 역할 기반(admin) + 소유권 기반 접근 제어
-- 참고: public.users.id = auth.uid() 를 사용자 식별 기준으로 사용

-- ===========================================================================
-- 헬퍼 함수 (SECURITY DEFINER: users 정책의 무한 재귀 방지)
-- ===========================================================================

-- 현재 로그인 사용자가 admin인지 판별
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role = 'admin'
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS '현재 로그인 사용자의 admin 여부 반환';

-- 현재 로그인 사용자의 role 반환 (role 변경 차단 검증용)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT u.role FROM public.users u
  WHERE u.id = auth.uid();
$$;

COMMENT ON FUNCTION public.current_user_role() IS '현재 로그인 사용자의 role 반환';

-- 특정 주문이 현재 사용자 소유인지 판별
CREATE OR REPLACE FUNCTION public.owns_order(p_order_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = p_order_id
      AND o.user_id = auth.uid()
  );
$$;

COMMENT ON FUNCTION public.owns_order(uuid) IS '주문 소유 여부 반환';

-- ===========================================================================
-- RLS 활성화
-- ===========================================================================
ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.like_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_settings ENABLE ROW LEVEL SECURITY;

-- ===========================================================================
-- 1. public.users
--    SELECT: 본인 profile / admin 전체
--    INSERT: 본인 id 로만
--    UPDATE: 본인 profile(role 변경 불가) / admin 전체
--    DELETE: admin 만
-- ===========================================================================
DROP POLICY IF EXISTS users_select ON public.users;
CREATE POLICY users_select ON public.users
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS users_insert ON public.users;
CREATE POLICY users_insert ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS users_update_self ON public.users;
CREATE POLICY users_update_self ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = public.current_user_role());

DROP POLICY IF EXISTS users_update_admin ON public.users;
CREATE POLICY users_update_admin ON public.users
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS users_delete ON public.users;
CREATE POLICY users_delete ON public.users
  FOR DELETE
  USING (public.is_admin());

-- ===========================================================================
-- 2. public.products
--    SELECT: 모두(hidden 제외) / admin 전체
--    INSERT/UPDATE/DELETE: admin 만
-- ===========================================================================
DROP POLICY IF EXISTS products_select ON public.products;
CREATE POLICY products_select ON public.products
  FOR SELECT
  USING (status <> 'hidden' OR public.is_admin());

DROP POLICY IF EXISTS products_insert ON public.products;
CREATE POLICY products_insert ON public.products
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS products_update ON public.products;
CREATE POLICY products_update ON public.products
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS products_delete ON public.products;
CREATE POLICY products_delete ON public.products
  FOR DELETE
  USING (public.is_admin());

-- ===========================================================================
-- 3. public.orders
--    SELECT: 본인 주문 / admin 전체
--    INSERT: 본인(user_id = auth.uid()) 만
--    UPDATE/DELETE: admin 만
-- ===========================================================================
DROP POLICY IF EXISTS orders_select ON public.orders;
CREATE POLICY orders_select ON public.orders
  FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS orders_insert ON public.orders;
CREATE POLICY orders_insert ON public.orders
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS orders_update ON public.orders;
CREATE POLICY orders_update ON public.orders
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS orders_delete ON public.orders;
CREATE POLICY orders_delete ON public.orders
  FOR DELETE
  USING (public.is_admin());

-- ===========================================================================
-- 4. public.order_items
--    SELECT/INSERT/UPDATE/DELETE: 해당 order 소유자 또는 admin
-- ===========================================================================
DROP POLICY IF EXISTS order_items_select ON public.order_items;
CREATE POLICY order_items_select ON public.order_items
  FOR SELECT
  USING (public.owns_order(order_id) OR public.is_admin());

DROP POLICY IF EXISTS order_items_insert ON public.order_items;
CREATE POLICY order_items_insert ON public.order_items
  FOR INSERT
  WITH CHECK (public.owns_order(order_id) OR public.is_admin());

DROP POLICY IF EXISTS order_items_update ON public.order_items;
CREATE POLICY order_items_update ON public.order_items
  FOR UPDATE
  USING (public.owns_order(order_id) OR public.is_admin())
  WITH CHECK (public.owns_order(order_id) OR public.is_admin());

DROP POLICY IF EXISTS order_items_delete ON public.order_items;
CREATE POLICY order_items_delete ON public.order_items
  FOR DELETE
  USING (public.owns_order(order_id) OR public.is_admin());

-- ===========================================================================
-- 5. public.payments
--    SELECT: 해당 order 소유자 또는 admin
--    INSERT/UPDATE/DELETE: admin 만
-- ===========================================================================
DROP POLICY IF EXISTS payments_select ON public.payments;
CREATE POLICY payments_select ON public.payments
  FOR SELECT
  USING (public.owns_order(order_id) OR public.is_admin());

DROP POLICY IF EXISTS payments_insert ON public.payments;
CREATE POLICY payments_insert ON public.payments
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS payments_update ON public.payments;
CREATE POLICY payments_update ON public.payments
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS payments_delete ON public.payments;
CREATE POLICY payments_delete ON public.payments
  FOR DELETE
  USING (public.is_admin());

-- ===========================================================================
-- 6. public.reviews
--    SELECT: 모두 허용
--    INSERT: 본인(user_id = auth.uid()) 만
--    UPDATE: 본인 작성분만
--    DELETE: 본인 또는 admin
-- ===========================================================================
DROP POLICY IF EXISTS reviews_select ON public.reviews;
CREATE POLICY reviews_select ON public.reviews
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS reviews_insert ON public.reviews;
CREATE POLICY reviews_insert ON public.reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS reviews_update ON public.reviews;
CREATE POLICY reviews_update ON public.reviews
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS reviews_delete ON public.reviews;
CREATE POLICY reviews_delete ON public.reviews
  FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- ===========================================================================
-- 7. public.cart_items
--    SELECT/INSERT/UPDATE/DELETE: 본인 장바구니만
-- ===========================================================================
DROP POLICY IF EXISTS cart_items_select ON public.cart_items;
CREATE POLICY cart_items_select ON public.cart_items
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS cart_items_insert ON public.cart_items;
CREATE POLICY cart_items_insert ON public.cart_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS cart_items_update ON public.cart_items;
CREATE POLICY cart_items_update ON public.cart_items
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS cart_items_delete ON public.cart_items;
CREATE POLICY cart_items_delete ON public.cart_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================================================================
-- 8. public.like_items
--    SELECT/INSERT/DELETE: 본인 찜하기만
-- ===========================================================================
DROP POLICY IF EXISTS like_items_select ON public.like_items;
CREATE POLICY like_items_select ON public.like_items
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS like_items_insert ON public.like_items;
CREATE POLICY like_items_insert ON public.like_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS like_items_delete ON public.like_items;
CREATE POLICY like_items_delete ON public.like_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================================================================
-- 9. public.mcp_settings
--    SELECT/INSERT/UPDATE/DELETE: admin 만
-- ===========================================================================
DROP POLICY IF EXISTS mcp_settings_select ON public.mcp_settings;
CREATE POLICY mcp_settings_select ON public.mcp_settings
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS mcp_settings_insert ON public.mcp_settings;
CREATE POLICY mcp_settings_insert ON public.mcp_settings
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS mcp_settings_update ON public.mcp_settings;
CREATE POLICY mcp_settings_update ON public.mcp_settings
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS mcp_settings_delete ON public.mcp_settings;
CREATE POLICY mcp_settings_delete ON public.mcp_settings
  FOR DELETE
  USING (public.is_admin());
