-- cart_items: 사용자당 상품 1행 UNIQUE (중복 수량은 합산 후 정리)

-- 1) 동일 (user_id, product_id) 중복이 있으면 수량 합산본만 남김
WITH ranked AS (
  SELECT
    id,
    user_id,
    product_id,
    quantity,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, product_id
      ORDER BY created_at ASC, id ASC
    ) AS rn,
    SUM(quantity) OVER (
      PARTITION BY user_id, product_id
    ) AS total_quantity
  FROM public.cart_items
)
UPDATE public.cart_items AS c
SET
  quantity = ranked.total_quantity,
  updated_at = now()
FROM ranked
WHERE c.id = ranked.id
  AND ranked.rn = 1
  AND ranked.total_quantity <> ranked.quantity;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, product_id
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM public.cart_items
)
DELETE FROM public.cart_items AS c
USING ranked
WHERE c.id = ranked.id
  AND ranked.rn > 1;

-- 2) UNIQUE 제약 추가
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cart_items_user_product_unique'
      AND conrelid = 'public.cart_items'::regclass
  ) THEN
    ALTER TABLE public.cart_items
      ADD CONSTRAINT cart_items_user_product_unique UNIQUE (user_id, product_id);
  END IF;
END $$;

COMMENT ON CONSTRAINT cart_items_user_product_unique ON public.cart_items IS
  '동일 사용자는 상품당 장바구니 항목 1개만 보유';
