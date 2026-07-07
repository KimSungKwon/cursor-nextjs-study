import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// 상품 시드 데이터 타입
// ---------------------------------------------------------------------------
type ProductStatus = "registered" | "hidden" | "sold_out";

interface ProductSeed {
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  image_url: string;
  status: ProductStatus;
  categories: string[];
}

// ---------------------------------------------------------------------------
// Unsplash 이미지 URL (카테고리별)
// ---------------------------------------------------------------------------
const IMG = {
  earbuds: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
  watch: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
  speaker: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
  keyboard: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
  mouse: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800",
  headphones: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
  electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800",
  monitor: "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?w=800",
  projector: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800",
  tshirt: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
  jacket: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
  shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
  cap: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800",
  backpack: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
  wallet: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800",
  sunglasses: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800",
  yoga: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800",
  dumbbell: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
} as const;

// ---------------------------------------------------------------------------
// 상품 샘플 데이터 (총 40개)
// - 카테고리: 전자제품 15 / 의류 10 / 가방·액세서리 8 / 운동용품 7
// - 가격대: 저가 10 / 중가 20 / 고가 10 (원화, 정수)
// - 상태: registered 35 / sold_out 3 / hidden 2
// ---------------------------------------------------------------------------
const PRODUCTS: ProductSeed[] = [
  // ===== 전자제품 (15) =====
  {
    name: "무선 이어폰 프로",
    description: "프리미엄 노이즈 캔슬링 무선 이어폰, 30시간 배터리 수명",
    price: 129000,
    sale_price: 99000,
    image_url: IMG.earbuds,
    status: "registered",
    categories: ["전자제품", "이어폰"],
  },
  {
    name: "스마트워치 울트라",
    description: "심박수 모니터와 GPS를 탑재한 고급 피트니스 스마트워치",
    price: 359000,
    sale_price: 299000,
    image_url: IMG.watch,
    status: "registered",
    categories: ["전자제품", "웨어러블"],
  },
  {
    name: "블루투스 스피커",
    description: "방수 기능과 20시간 재생이 가능한 휴대용 블루투스 스피커",
    price: 89000,
    image_url: IMG.speaker,
    status: "registered",
    categories: ["전자제품", "오디오"],
  },
  {
    name: "기계식 키보드",
    description: "청축 스위치와 RGB 백라이트를 갖춘 게이밍 기계식 키보드",
    price: 119000,
    sale_price: 95000,
    image_url: IMG.keyboard,
    status: "registered",
    categories: ["전자제품", "주변기기"],
  },
  {
    name: "무선 게이밍 마우스",
    description: "초경량 설계와 고정밀 센서를 탑재한 무선 게이밍 마우스",
    price: 69000,
    image_url: IMG.mouse,
    status: "registered",
    categories: ["전자제품", "주변기기"],
  },
  {
    name: "노이즈 캔슬링 헤드폰",
    description: "액티브 노이즈 캔슬링과 40시간 배터리의 오버이어 헤드폰",
    price: 289000,
    image_url: IMG.headphones,
    status: "registered",
    categories: ["전자제품", "오디오"],
  },
  {
    name: "USB-C 고속 충전기",
    description: "65W 출력으로 노트북까지 충전 가능한 고속 충전기",
    price: 29000,
    image_url: IMG.electronics,
    status: "registered",
    categories: ["전자제품", "액세서리"],
  },
  {
    name: "4K 웹캠",
    description: "자동 초점과 노이즈 캔슬링 마이크를 갖춘 4K 웹캠",
    price: 99000,
    image_url: IMG.electronics,
    status: "registered",
    categories: ["전자제품", "주변기기"],
  },
  {
    name: "휴대용 SSD 1TB",
    description: "USB 3.2를 지원하는 초고속 전송 속도의 휴대용 외장 SSD 1TB",
    price: 139000,
    image_url: IMG.electronics,
    status: "registered",
    categories: ["전자제품", "저장장치"],
  },
  {
    name: "게이밍 헤드셋",
    description: "7.1 서라운드 사운드와 착탈식 마이크를 갖춘 게이밍 헤드셋",
    price: 79000,
    image_url: IMG.headphones,
    status: "registered",
    categories: ["전자제품", "오디오"],
  },
  {
    name: "스마트 전구 세트",
    description: "앱으로 색상과 밝기를 조절하는 스마트 LED 전구 4개 세트",
    price: 55000,
    image_url: IMG.electronics,
    status: "registered",
    categories: ["전자제품", "스마트홈"],
  },
  {
    name: "무선 충전 패드",
    description: "15W 고속 무선 충전을 지원하는 슬림 무선 충전 패드",
    price: 25000,
    image_url: IMG.electronics,
    status: "registered",
    categories: ["전자제품", "액세서리"],
  },
  {
    name: "미니 프로젝터",
    description: "1080p를 지원하고 200인치 대화면을 구현하는 휴대용 미니 프로젝터",
    price: 219000,
    image_url: IMG.projector,
    status: "sold_out",
    categories: ["전자제품", "영상"],
  },
  {
    name: "스마트 스피커 허브",
    description: "음성 비서와 스마트홈 제어를 지원하는 스마트 스피커 허브",
    price: 109000,
    image_url: IMG.speaker,
    status: "hidden",
    categories: ["전자제품", "스마트홈"],
  },
  {
    name: "4K 모니터",
    description: "27인치 IPS 패널과 HDR을 지원하는 4K 모니터",
    price: 349000,
    image_url: IMG.monitor,
    status: "registered",
    categories: ["전자제품", "디스플레이"],
  },

  // ===== 의류 (10) =====
  {
    name: "클래식 화이트 티셔츠",
    description: "100% 유기농 면으로 제작된 편안한 핏의 화이트 티셔츠",
    price: 19900,
    image_url: IMG.tshirt,
    status: "registered",
    categories: ["의류", "상의"],
  },
  {
    name: "데님 재킷",
    description: "빈티지 워싱으로 마감한 클래식한 데님 재킷",
    price: 89000,
    image_url: IMG.jacket,
    status: "registered",
    categories: ["의류", "아우터"],
  },
  {
    name: "캐주얼 스니커즈",
    description: "데일리로 신기 좋은 가벼운 캐주얼 스니커즈",
    price: 79000,
    image_url: IMG.shoes,
    status: "registered",
    categories: ["의류", "신발"],
  },
  {
    name: "야구 모자",
    description: "사이즈 조절이 가능한 스트랩을 갖춘 코튼 야구 모자",
    price: 24900,
    image_url: IMG.cap,
    status: "registered",
    categories: ["의류", "액세서리"],
  },
  {
    name: "오버핏 후드티",
    description: "도톰한 기모 안감의 데일리 오버핏 후드 티셔츠",
    price: 59000,
    sale_price: 45000,
    image_url: IMG.tshirt,
    status: "registered",
    categories: ["의류", "상의"],
  },
  {
    name: "슬림핏 청바지",
    description: "신축성 있는 원단으로 제작된 슬림핏 스트레치 청바지",
    price: 69000,
    image_url: IMG.jacket,
    status: "registered",
    categories: ["의류", "하의"],
  },
  {
    name: "니트 스웨터",
    description: "부드러운 촉감의 라운드넥 니트 스웨터",
    price: 79000,
    image_url: IMG.tshirt,
    status: "registered",
    categories: ["의류", "상의"],
  },
  {
    name: "경량 패딩 점퍼",
    description: "가볍고 따뜻한 구스다운 충전재의 경량 패딩 점퍼",
    price: 189000,
    sale_price: 149000,
    image_url: IMG.jacket,
    status: "registered",
    categories: ["의류", "아우터"],
  },
  {
    name: "코튼 셔츠",
    description: "사계절 활용도가 높은 베이직 코튼 셔츠",
    price: 39000,
    image_url: IMG.tshirt,
    status: "registered",
    categories: ["의류", "상의"],
  },
  {
    name: "트레이닝 조거 팬츠",
    description: "활동성이 뛰어난 기능성 트레이닝 조거 팬츠",
    price: 55000,
    image_url: IMG.jacket,
    status: "sold_out",
    categories: ["의류", "하의"],
  },

  // ===== 가방 · 액세서리 (8) =====
  {
    name: "가죽 백팩",
    description: "노트북 수납 공간을 갖춘 수제 천연 가죽 백팩",
    price: 159000,
    image_url: IMG.backpack,
    status: "registered",
    categories: ["가방", "백팩"],
  },
  {
    name: "미니멀 지갑",
    description: "카드 수납에 최적화된 슬림 미니멀 가죽 지갑",
    price: 45000,
    image_url: IMG.wallet,
    status: "registered",
    categories: ["액세서리", "지갑"],
  },
  {
    name: "클래식 선글라스",
    description: "UV400 자외선 차단 기능을 갖춘 클래식 선글라스",
    price: 89000,
    image_url: IMG.sunglasses,
    status: "registered",
    categories: ["액세서리", "아이웨어"],
  },
  {
    name: "캔버스 토트백",
    description: "넉넉한 수납 공간의 데일리 캔버스 토트백",
    price: 39000,
    image_url: IMG.backpack,
    status: "registered",
    categories: ["가방", "토트백"],
  },
  {
    name: "여행용 캐리어",
    description: "360도 회전 바퀴와 TSA 잠금장치를 갖춘 대형 여행용 캐리어",
    price: 259000,
    sale_price: 199000,
    image_url: IMG.backpack,
    status: "registered",
    categories: ["가방", "캐리어"],
  },
  {
    name: "크로스백",
    description: "가볍고 실용적인 데일리 크로스백",
    price: 69000,
    image_url: IMG.backpack,
    status: "registered",
    categories: ["가방", "크로스백"],
  },
  {
    name: "가죽 벨트",
    description: "정장과 캐주얼에 모두 어울리는 리버서블 가죽 벨트",
    price: 55000,
    image_url: IMG.wallet,
    status: "registered",
    categories: ["액세서리", "벨트"],
  },
  {
    name: "아날로그 손목시계",
    description: "사파이어 글라스와 스테인리스 스틸 밴드를 갖춘 아날로그 손목시계",
    price: 199000,
    image_url: IMG.watch,
    status: "registered",
    categories: ["액세서리", "시계"],
  },

  // ===== 운동용품 (7) =====
  {
    name: "요가 매트 프로",
    description: "미끄럼 방지 처리된 6mm 두께의 프리미엄 요가 매트",
    price: 55000,
    image_url: IMG.yoga,
    status: "registered",
    categories: ["운동용품", "요가"],
  },
  {
    name: "조정 가능한 덤벨 세트",
    description: "2.5kg부터 24kg까지 무게 조절이 가능한 가변 덤벨 세트",
    price: 229000,
    sale_price: 189000,
    image_url: IMG.dumbbell,
    status: "registered",
    categories: ["운동용품", "웨이트"],
  },
  {
    name: "프리미엄 러닝화",
    description: "쿠셔닝이 뛰어난 경량 소재의 프리미엄 러닝화",
    price: 169000,
    image_url: IMG.shoes,
    status: "sold_out",
    categories: ["운동용품", "신발"],
  },
  {
    name: "폼롤러",
    description: "근막 이완에 효과적인 고밀도 폼롤러",
    price: 29000,
    image_url: IMG.yoga,
    status: "registered",
    categories: ["운동용품", "스트레칭"],
  },
  {
    name: "스포츠 물통",
    description: "누수 방지 뚜껑을 갖춘 1L 대용량 스포츠 물통",
    price: 15000,
    image_url: IMG.yoga,
    status: "registered",
    categories: ["운동용품", "액세서리"],
  },
  {
    name: "저항 밴드 세트",
    description: "5단계 강도로 구성된 홈트레이닝 저항 밴드 세트",
    price: 52000,
    image_url: IMG.dumbbell,
    status: "hidden",
    categories: ["운동용품", "홈트"],
  },
  {
    name: "헬스 장갑",
    description: "손목 보호 스트랩이 있는 미끄럼 방지 헬스 장갑",
    price: 19000,
    image_url: IMG.dumbbell,
    status: "registered",
    categories: ["운동용품", "액세서리"],
  },
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

// ---------------------------------------------------------------------------
// Supabase 클라이언트 생성 (RLS 우회를 위해 secret key 사용)
// ---------------------------------------------------------------------------
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
// 상품 데이터 삽입
// ---------------------------------------------------------------------------
export async function insertProducts(
  supabase: ReturnType<typeof createSupabaseClient>,
): Promise<void> {
  // 중복 방지: 기존 상품이 40개 이상이면 스킵
  const { count, error: countError } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  if (countError) {
    throw countError;
  }

  if ((count ?? 0) >= 40) {
    console.log(`이미 상품이 ${count}개 존재하여 시드를 건너뜁니다.`);
    return;
  }

  console.log(`상품 ${PRODUCTS.length}개 삽입을 시작합니다...`);

  const { error } = await supabase.from("products").insert(PRODUCTS);

  if (error) {
    // 중복 키(23505)는 무시하고 종료
    if (error.code === "23505") {
      console.log("중복 상품이 감지되어 해당 삽입을 무시합니다.");
      return;
    }

    throw error;
  }

  console.log(`상품 ${PRODUCTS.length}개 삽입 완료`);
}

async function main(): Promise<void> {
  loadEnvLocal();

  const supabase = createSupabaseClient();

  await insertProducts(supabase);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  console.error(message);
  process.exit(1);
});
