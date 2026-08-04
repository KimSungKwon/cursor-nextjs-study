-- reviews: 사용자당 상품 1리뷰 UNIQUE 제약

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'reviews_user_product_unique'
      AND conrelid = 'public.reviews'::regclass
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT reviews_user_product_unique UNIQUE (user_id, product_id);
  END IF;
END $$;

COMMENT ON CONSTRAINT reviews_user_product_unique ON public.reviews IS
  '동일 사용자는 상품당 리뷰 1개만 작성 가능';
