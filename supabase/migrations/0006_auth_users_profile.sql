-- auth.users ↔ public.users 1:1 프로필 연동
-- public.users.id = auth.users.id (FK CASCADE)

-- ===========================================================================
-- 1. user_role enum (이미 존재하면 생성하지 않음)
-- ===========================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'user_role'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.user_role AS ENUM ('user', 'admin');
    COMMENT ON TYPE public.user_role IS '사용자 권한 (일반 사용자 / 관리자)';
  END IF;
END $$;

-- ===========================================================================
-- 2. public.users 테이블 재정의
--    - 없으면 생성, 있으면면 id 기본값 제거 후 auth.users 기준으로 정리
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  display_name text,
  role public.user_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS '앱 사용자 프로필 (auth.users와 1:1)';
COMMENT ON COLUMN public.users.id IS 'auth.users.id와 동일한 사용자 ID';
COMMENT ON COLUMN public.users.email IS '로그인 이메일 (고유)';
COMMENT ON COLUMN public.users.display_name IS '표시 이름';
COMMENT ON COLUMN public.users.role IS '사용자 권한';
COMMENT ON COLUMN public.users.created_at IS '생성 일시';
COMMENT ON COLUMN public.users.updated_at IS '수정 일시';

-- auth.users.id를 그대로 쓰도록 자동 UUID 기본값 제거
ALTER TABLE public.users
  ALTER COLUMN id DROP DEFAULT;

-- 이메일로 auth.users와 매칭되는 행의 id를 auth.users.id로 맞춤
-- (자식 테이블 FK를 잠시 해제 후 갱신)
DO $$
DECLARE
  r RECORD;
BEGIN
  -- 자식 FK 임시 해제
  ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
  ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;
  ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
  ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey;
  ALTER TABLE public.like_items DROP CONSTRAINT IF EXISTS like_items_user_id_fkey;

  FOR r IN
    SELECT pu.id AS old_id, au.id AS new_id
    FROM public.users pu
    INNER JOIN auth.users au ON lower(au.email) = lower(pu.email)
    WHERE pu.id <> au.id
  LOOP
    UPDATE public.orders SET user_id = r.new_id WHERE user_id = r.old_id;
    UPDATE public.payments SET user_id = r.new_id WHERE user_id = r.old_id;
    UPDATE public.reviews SET user_id = r.new_id WHERE user_id = r.old_id;
    UPDATE public.cart_items SET user_id = r.new_id WHERE user_id = r.old_id;
    UPDATE public.like_items SET user_id = r.new_id WHERE user_id = r.old_id;

    -- 이미 동일 id 행이 있으면 구행만 제거, 없으면 id 갱신
    IF EXISTS (SELECT 1 FROM public.users WHERE id = r.new_id) THEN
      DELETE FROM public.users WHERE id = r.old_id;
    ELSE
      UPDATE public.users SET id = r.new_id WHERE id = r.old_id;
    END IF;
  END LOOP;

  -- auth.users에 없는 고아 프로필 및 종속 데이터 정리
  DELETE FROM public.orders
  WHERE user_id IN (
    SELECT id FROM public.users u
    WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = u.id)
  );
  DELETE FROM public.payments
  WHERE user_id IN (
    SELECT id FROM public.users u
    WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = u.id)
  );
  DELETE FROM public.reviews
  WHERE user_id IN (
    SELECT id FROM public.users u
    WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = u.id)
  );
  DELETE FROM public.cart_items
  WHERE user_id IN (
    SELECT id FROM public.users u
    WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = u.id)
  );
  DELETE FROM public.like_items
  WHERE user_id IN (
    SELECT id FROM public.users u
    WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = u.id)
  );
  DELETE FROM public.users u
  WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = u.id);

  -- 자식 FK 복원
  ALTER TABLE public.orders
    ADD CONSTRAINT orders_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE RESTRICT;
  ALTER TABLE public.payments
    ADD CONSTRAINT payments_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE RESTRICT;
  ALTER TABLE public.reviews
    ADD CONSTRAINT reviews_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;
  ALTER TABLE public.cart_items
    ADD CONSTRAINT cart_items_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;
  ALTER TABLE public.like_items
    ADD CONSTRAINT like_items_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;
END $$;

-- ===========================================================================
-- 3. Foreign Key: public.users.id → auth.users.id
-- ===========================================================================
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_auth_fk;
ALTER TABLE public.users
  ADD CONSTRAINT users_auth_fk
  FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE;

-- ===========================================================================
-- 4. handle_new_auth_user(): auth.users INSERT 시 프로필 자동 생성
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'name', ''),
      NULLIF(NEW.raw_user_meta_data->>'username', ''),
      split_part(NEW.email, '@', 1)
    ),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_auth_user() IS
  'auth.users 생성 시 public.users 프로필을 자동 생성';

-- ===========================================================================
-- 5. 트리거: auth.users INSERT → handle_new_auth_user
-- ===========================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ===========================================================================
-- 6. 기존 auth.users → public.users 백필
-- ===========================================================================
INSERT INTO public.users (id, email, display_name, role, created_at, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(
    NULLIF(au.raw_user_meta_data->>'display_name', ''),
    NULLIF(au.raw_user_meta_data->>'name', ''),
    NULLIF(au.raw_user_meta_data->>'username', ''),
    split_part(au.email, '@', 1)
  ),
  'user',
  COALESCE(au.created_at, now()),
  now()
FROM auth.users au
WHERE au.email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- ===========================================================================
-- 7. RLS 헬퍼 + users 정책 (본인 / admin)
-- ===========================================================================
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

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

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
  USING (auth.uid() = id OR public.is_admin());
