-- public.users에 프로필 이미지 URL 컬럼 추가

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS image_url text;

COMMENT ON COLUMN public.users.image_url IS '프로필 이미지 URL 또는 data URL';
