export interface SupabaseEnv {
  url: string;
  publishableKey: string;
  secretKey?: string; // 서버 전용
}

export interface PublicEnv {
  supabase: Omit<SupabaseEnv, "secretKey">; // secretKey 뺴기
  siteUrl: string;
}

export interface ServerEnv extends PublicEnv {
  supabase: Required<SupabaseEnv>; // secretKey도 필수
}

function validateEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `환경변수 ${name}이(가) 설정되지 않았습니다. .env.local 파일을 확인하세요.`
    );
  }
  return value;
}

// 클라이언트에서 사용 가능한 환경 변수
export function getPublicEnv(): PublicEnv {
  const url = validateEnvVar(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  
  const publishableKey = validateEnvVar(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  return {
    supabase: {
      url,
      publishableKey,
    },
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  };
}

// 서버 전용 환경 변수 (secretKey 포함)
export function getServerEnv(): ServerEnv {
  const publicEnv = getPublicEnv();
  const secretKey = validateEnvVar(
    "SUPABASE_SECRET_KEY",
    process.env.SUPABASE_SECRET_KEY
  );

  return {
    ...publicEnv,
    supabase: {
      ...publicEnv.supabase,
      secretKey,
    },
  };
}