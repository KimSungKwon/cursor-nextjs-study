import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const DEFAULT_MIGRATION_FILE = "supabase/migrations/0001_init_schema.sql";

function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), ".env.local");

  try {
    const content = readFileSync(envPath, "utf-8");

    for (const line of content.split("\n")) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^['"]|['"]$/g, "");

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    throw new Error(".env.local 파일을 찾을 수 없습니다.");
  }
}

function getProjectRef(url: string): string {
  const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);

  if (!match) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL 형식이 올바르지 않습니다.");
  }

  return match[1];
}

async function executeQuery(
  projectRef: string,
  accessToken: string,
  query: string,
): Promise<unknown> {
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `마이그레이션 실행 실패 (${response.status}): ${errorText}\n` +
        "복구가 어려운 경우에만 Supabase SQL Editor에서 수동 실행을 검토하세요.",
    );
  }

  return response.json();
}

async function runMigration(): Promise<void> {
  loadEnvLocal();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL이 없습니다.");
  }

  if (!accessToken) {
    throw new Error("SUPABASE_ACCESS_TOKEN이 없습니다.");
  }

  const migrationFile = process.argv[2] ?? DEFAULT_MIGRATION_FILE;
  const sqlPath = resolve(process.cwd(), migrationFile);
  const query = readFileSync(sqlPath, "utf-8");
  const projectRef = getProjectRef(supabaseUrl);
  const migrationName = basename(migrationFile);
  const escapedName = migrationName.replace(/'/g, "''");

  // 1) 마이그레이션 이력 테이블 보장 + 기존에 적용된 0001 백필
  //    (public.users가 이미 존재하면 0001은 적용된 것으로 간주)
  await executeQuery(
    projectRef,
    accessToken,
    `CREATE TABLE IF NOT EXISTS public.schema_migrations (
       name text PRIMARY KEY,
       applied_at timestamptz NOT NULL DEFAULT now()
     );
     INSERT INTO public.schema_migrations (name)
     SELECT '0001_init_schema.sql'
     WHERE to_regclass('public.users') IS NOT NULL
     ON CONFLICT (name) DO NOTHING;`,
  );

  // 2) 이미 적용된 마이그레이션인지 확인
  const appliedRows = await executeQuery(
    projectRef,
    accessToken,
    `SELECT name FROM public.schema_migrations WHERE name = '${escapedName}';`,
  );

  if (Array.isArray(appliedRows) && appliedRows.length > 0) {
    console.log(`이미 적용된 마이그레이션입니다. 건너뜁니다: ${migrationName}`);
    return;
  }

  // 3) 마이그레이션 실행 + 적용 이력 기록 (단일 호출로 원자적 처리)
  await executeQuery(
    projectRef,
    accessToken,
    `${query}\n\nINSERT INTO public.schema_migrations (name) VALUES ('${escapedName}');`,
  );

  console.log(`마이그레이션 완료: ${migrationFile}`);
}

runMigration().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  console.error(message);
  process.exit(1);
});
