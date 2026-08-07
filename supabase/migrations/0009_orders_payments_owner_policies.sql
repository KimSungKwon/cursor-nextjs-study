-- 본인 주문/결제 생성·수정 허용 (토스 결제 플로우)
-- orders: 소유자 UPDATE
-- payments: 소유자 INSERT/UPDATE

DROP POLICY IF EXISTS orders_update ON public.orders;
CREATE POLICY orders_update ON public.orders
  FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS payments_insert ON public.payments;
CREATE POLICY payments_insert ON public.payments
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND public.owns_order(order_id)
  );

DROP POLICY IF EXISTS payments_update ON public.payments;
CREATE POLICY payments_update ON public.payments
  FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());
