import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// 상수 / 타입
// ---------------------------------------------------------------------------
const MIN_USERS = 30;
const MAX_PRODUCTS_WITH_REVIEWS = 20;
const MIN_REVIEWS_PER_PRODUCT = 3;
const MAX_REVIEWS_PER_PRODUCT = 15;
const BATCH_SIZE = 10;

type SeedUser = {
  id: string;
  email: string;
  display_name: string | null;
};

type SeedProduct = {
  id: string;
  name: string;
};

type ReviewInsert = {
  user_id: string;
  product_id: string;
  rating: number;
  content: string;
  created_at: string;
};

const FIRST_NAMES = [
  "Sofia",
  "Nicolas",
  "Emma",
  "Liam",
  "Olivia",
  "Noah",
  "Ava",
  "Ethan",
  "Mia",
  "Lucas",
  "Isabella",
  "Mason",
  "Amelia",
  "Logan",
  "Harper",
  "James",
  "Evelyn",
  "Benjamin",
  "Chloe",
  "Henry",
  "Ella",
  "Alexander",
  "Grace",
  "Sebastian",
  "Lily",
  "Jack",
  "Zoe",
  "Daniel",
  "Nora",
  "Samuel",
  "Hannah",
  "David",
];

const LAST_NAMES = [
  "Kim",
  "Lee",
  "Park",
  "Choi",
  "Jung",
  "Han",
  "Harvetz",
  "Jensen",
  "Smith",
  "Johnson",
  "Brown",
  "Davis",
  "Wilson",
  "Taylor",
  "Anderson",
  "Thomas",
  "Moore",
  "Martin",
];

const REVIEW_CONTENTS = [
  "Awesome Product. 정말 만족합니다. 배송도 빠르고 품질이 좋아요.",
  "가격 대비 성능이 훌륭합니다. 주변에 추천하고 싶어요.",
  "디자인이 세련되고 사용감이 좋습니다.",
  "기대한 만큼 만족스러워요. 재구매 의사 있습니다.",
  "포장 상태가 꼼꼼했고 상품도 깔끔했습니다.",
  "일상에서 쓰기 편하고 실용적입니다.",
  "처음엔 반신반의했는데 사용해보니 만족합니다.",
  "소음이 적고 마감이 탄탄해서 좋았습니다.",
  "설명과 실물이 거의 동일해서 신뢰가 가요.",
  "가벼운 편이라 이동이 편합니다.",
  "색감이 사진보다 더 예뻐요.",
  "내구성이 좋아 보여서 오래 쓸 수 있을 것 같아요.",
  "조립/사용법이 직관적이라 금방 익숙해졌습니다.",
  "선물용으로 샀는데 상대방이 매우 좋아했어요.",
  "가성비가 뛰어난 선택이라고 생각합니다.",
  "배터리가 조금 아쉽지만 전반적으로 만족합니다.",
  "소소한 단점은 있지만 충분히 추천할 만합니다.",
  "고객센터 응대도 친절했고 제품도 좋아요.",
  "매일 쓰고 있는데 아직까지 문제 없습니다.",
  "퀄리티가 기대 이상이었습니다.",
];

// ---------------------------------------------------------------------------
// .env.local 로드
// ---------------------------------------------------------------------------
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

function createSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL이 없습니다.");
  }

  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY가 없습니다.");
  }

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: "public",
    },
  });
}

// ---------------------------------------------------------------------------
// 유틸
// ---------------------------------------------------------------------------
function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pickOne<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];

  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [next[i], next[j]] = [next[j], next[i]];
  }

  return next;
}

/** 별점 분포: 1(10%) / 2(10%) / 3(10%) / 4(40%) / 5(30%) */
function pickRating(): number {
  const roll = Math.random();

  if (roll < 0.1) return 1;
  if (roll < 0.2) return 2;
  if (roll < 0.3) return 3;
  if (roll < 0.7) return 4;
  return 5;
}

/** 최근 1~180일 사이 랜덤 시각 */
function randomCreatedAt(): string {
  const daysAgo = randomInt(1, 180);
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  date.setUTCHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59), 0);
  return date.toISOString();
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}

// ---------------------------------------------------------------------------
// 사용자 보장 (최소 30명)
// ---------------------------------------------------------------------------
async function ensureUsers(supabase: SupabaseClient): Promise<SeedUser[]> {
  const { data: existing, error } = await supabase
    .from("users")
    .select("id, email, display_name");

  if (error) {
    throw new Error(`사용자 조회 실패: ${error.message}`);
  }

  const users: SeedUser[] = (existing ?? []).map((row) => ({
    id: row.id as string,
    email: row.email as string,
    display_name: (row.display_name as string | null) ?? null,
  }));

  const shortage = MIN_USERS - users.length;

  if (shortage <= 0) {
    console.log(`사용자 ${users.length}명 확인 (충분)`);
    return users;
  }

  console.log(`사용자 ${shortage}명 추가 생성...`);

  const existingEmails = new Set(users.map((user) => user.email.toLowerCase()));
  const toInsert: { email: string; display_name: string; role: "user" }[] = [];
  let index = 1;

  while (toInsert.length < shortage) {
    const first = pickOne(FIRST_NAMES);
    const last = pickOne(LAST_NAMES);
    const email = `reviewer${String(Date.now()).slice(-5)}${index}@example.com`;

    if (existingEmails.has(email.toLowerCase())) {
      index += 1;
      continue;
    }

    existingEmails.add(email.toLowerCase());
    toInsert.push({
      email,
      display_name: `${first} ${last}`,
      role: "user",
    });
    index += 1;
  }

  for (const batch of chunkArray(toInsert, BATCH_SIZE)) {
    const { data, error: insertError } = await supabase
      .from("users")
      .insert(batch)
      .select("id, email, display_name");

    if (insertError) {
      throw new Error(`사용자 삽입 실패: ${insertError.message}`);
    }

    for (const row of data ?? []) {
      users.push({
        id: row.id as string,
        email: row.email as string,
        display_name: (row.display_name as string | null) ?? null,
      });
    }
  }

  console.log(`사용자 총 ${users.length}명 준비 완료`);
  return users;
}

// ---------------------------------------------------------------------------
// 리뷰 시드
// ---------------------------------------------------------------------------
export async function insertReviews(supabase: SupabaseClient): Promise<void> {
  const users = await ensureUsers(supabase);

  const { data: productsData, error: productsError } = await supabase
    .from("products")
    .select("id, name")
    .eq("status", "registered");

  if (productsError) {
    throw new Error(`상품 조회 실패: ${productsError.message}`);
  }

  const products = (productsData ?? []) as SeedProduct[];

  if (products.length === 0) {
    console.log("registered 상품이 없어 리뷰 시드를 건너뜁니다.");
    return;
  }

  const targetProducts = shuffle(products).slice(0, MAX_PRODUCTS_WITH_REVIEWS);
  console.log(
    `리뷰 대상 상품 ${targetProducts.length}개 (최대 ${MAX_PRODUCTS_WITH_REVIEWS})`,
  );

  const { data: existingReviews, error: existingError } = await supabase
    .from("reviews")
    .select("user_id, product_id")
    .in(
      "product_id",
      targetProducts.map((product) => product.id),
    );

  if (existingError) {
    throw new Error(`기존 리뷰 조회 실패: ${existingError.message}`);
  }

  const reviewedPairs = new Set(
    (existingReviews ?? []).map(
      (row) => `${row.user_id as string}:${row.product_id as string}`,
    ),
  );

  const pendingInserts: ReviewInsert[] = [];
  const ratingAccumulator = new Map<
    string,
    { sum: number; count: number }
  >();

  for (const product of targetProducts) {
    const reviewCount = randomInt(
      MIN_REVIEWS_PER_PRODUCT,
      MAX_REVIEWS_PER_PRODUCT,
    );
    const availableUsers = shuffle(
      users.filter(
        (user) => !reviewedPairs.has(`${user.id}:${product.id}`),
      ),
    );

    const selectedUsers = availableUsers.slice(
      0,
      Math.min(reviewCount, availableUsers.length),
    );

    if (selectedUsers.length === 0) {
      console.log(
        `- [${product.name}] 작성 가능 사용자 없음 (이미 리뷰 존재)`,
      );
      continue;
    }

    console.log(
      `- [${product.name}] 리뷰 ${selectedUsers.length}개 생성 예정`,
    );

    for (const user of selectedUsers) {
      const rating = pickRating();
      pendingInserts.push({
        user_id: user.id,
        product_id: product.id,
        rating,
        content: pickOne(REVIEW_CONTENTS),
        created_at: randomCreatedAt(),
      });
      reviewedPairs.add(`${user.id}:${product.id}`);

      const current = ratingAccumulator.get(product.id) ?? {
        sum: 0,
        count: 0,
      };
      current.sum += rating;
      current.count += 1;
      ratingAccumulator.set(product.id, current);
    }
  }

  if (pendingInserts.length === 0) {
    console.log("새로 삽입할 리뷰가 없습니다.");
    return;
  }

  console.log(`리뷰 ${pendingInserts.length}개 배치 삽입 시작...`);

  let inserted = 0;

  for (const [batchIndex, batch] of chunkArray(
    pendingInserts,
    BATCH_SIZE,
  ).entries()) {
    const { error: insertError } = await supabase.from("reviews").insert(batch);

    if (insertError) {
      console.error(
        `배치 ${batchIndex + 1} 삽입 실패: ${insertError.message}`,
      );
      throw new Error(`리뷰 배치 삽입 실패: ${insertError.message}`);
    }

    inserted += batch.length;
    console.log(
      `배치 ${batchIndex + 1}: ${batch.length}개 삽입 (누적 ${inserted}/${pendingInserts.length})`,
    );
  }

  // 상품 평균 별점 갱신 (UI용)
  for (const product of targetProducts) {
    const { data: productReviews, error: reviewAggError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", product.id);

    if (reviewAggError) {
      console.error(
        `상품 ${product.id} 평점 집계 실패: ${reviewAggError.message}`,
      );
      continue;
    }

    const ratings = (productReviews ?? []).map((row) => Number(row.rating));

    if (ratings.length === 0) {
      continue;
    }

    const average =
      Math.round(
        (ratings.reduce((sum, value) => sum + value, 0) / ratings.length) * 100,
      ) / 100;

    const { error: updateError } = await supabase
      .from("products")
      .update({ rating_average: average })
      .eq("id", product.id);

    if (updateError) {
      console.error(
        `상품 ${product.id} rating_average 갱신 실패: ${updateError.message}`,
      );
    }
  }

  console.log(`리뷰 시드 완료: ${inserted}개 삽입`);
}

async function main(): Promise<void> {
  loadEnvLocal();
  const supabase = createSupabaseClient();
  await insertReviews(supabase);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
