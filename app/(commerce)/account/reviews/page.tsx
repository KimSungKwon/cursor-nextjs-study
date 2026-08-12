import { redirect } from "next/navigation";
import { AccountSidebar } from "@/components/account/AccountSidebar/AccountSidebar";
import { MyReviewsSection } from "@/components/account/MyReviewsSection/MyReviewsSection";
import {
  REVIEWS_PAGE_SIZE,
  type MyReviewItem,
  type MyReviewsListResult,
  type MyReviewProduct,
} from "@/components/account/reviews/types";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS, AUTH_URLS } from "@/commons/constants/url";
import { createClient } from "@/lib/supabase/server";

type ReviewsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

type UsersProfileRow = {
  display_name: string | null;
  email: string;
  role: string;
  image_url: string | null;
};

type ReviewedProductRow = {
  id: string;
  name: string;
  image_url: string | null;
};

type ReviewJoinRow = {
  id: string;
  user_id: string;
  product_id: string;
  rating: number | string;
  content: string | null;
  created_at: string;
  products: ReviewedProductRow | ReviewedProductRow[] | null;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

function parsePage(raw: string | undefined): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
}

function toSafeNumber(value: number | string | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapProduct(row: ReviewedProductRow): MyReviewProduct {
  return {
    id: row.id,
    name: row.name,
    imageUrl: row.image_url,
  };
}

function normalizeProduct(
  products: ReviewJoinRow["products"],
): MyReviewProduct | null {
  if (!products) {
    return null;
  }
  const row = Array.isArray(products) ? products[0] : products;
  if (!row?.id || !row.name) {
    return null;
  }
  return mapProduct(row);
}

function mapReviewRow(row: ReviewJoinRow): MyReviewItem | null {
  const product = normalizeProduct(row.products);
  if (!product) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    rating: Math.min(5, Math.max(1, Math.round(toSafeNumber(row.rating)))),
    content: row.content?.trim() || "",
    createdAt: row.created_at,
    product,
  };
}

async function getUserProfile(
  supabase: SupabaseServerClient,
  userId: string,
  fallbackEmail: string,
): Promise<{
  displayName: string | null;
  email: string;
  imageUrl: string | null;
}> {
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("display_name, email, role, image_url")
    .eq("id", userId)
    .single();

  const profileRow = profile as UsersProfileRow | null;

  return {
    email:
      !profileError && profileRow?.email
        ? profileRow.email
        : fallbackEmail,
    displayName:
      !profileError && profileRow ? profileRow.display_name : null,
    imageUrl: !profileError && profileRow ? profileRow.image_url : null,
  };
}

async function getMyReviews(
  supabase: SupabaseServerClient,
  userId: string,
  page: number,
): Promise<MyReviewsListResult> {
  const from = (page - 1) * REVIEWS_PAGE_SIZE;
  const to = from + REVIEWS_PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("reviews")
    .select(
      `
        id,
        user_id,
        product_id,
        rating,
        content,
        created_at,
        products (
          id,
          name,
          image_url
        )
      `,
      { count: "exact" },
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`리뷰 목록 조회 실패: ${error.message}`);
  }

  const totalCount = count ?? 0;
  const totalPages =
    totalCount === 0 ? 1 : Math.ceil(totalCount / REVIEWS_PAGE_SIZE);
  const rows = (data ?? []) as unknown as ReviewJoinRow[];

  const items: MyReviewItem[] = [];
  for (const row of rows) {
    if (!row?.id || !row.created_at || !row.user_id || !row.product_id) {
      continue;
    }
    const mapped = mapReviewRow(row);
    if (mapped) {
      items.push(mapped);
    }
  }

  return {
    items,
    totalCount,
    page,
    totalPages,
  };
}

/**
 * 마이페이지 리뷰 내역 — AccountSidebar + MyReviewsSection
 */
const ReviewsPage = async ({ searchParams }: ReviewsPageProps) => {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(AUTH_URLS.LOGIN);
  }

  const params = await searchParams;
  const requestedPage = parsePage(params.page);

  const [profile, reviews] = await Promise.all([
    getUserProfile(supabase, user.id, user.email ?? ""),
    getMyReviews(supabase, user.id, requestedPage),
  ]);

  if (reviews.totalCount === 0 && requestedPage > 1) {
    redirect(ACCOUNT_URLS.REVIEWS);
  }

  if (reviews.totalCount > 0 && requestedPage > reviews.totalPages) {
    redirect(`${ACCOUNT_URLS.REVIEWS}?page=${reviews.totalPages}`);
  }

  const authorName =
    profile.displayName?.trim() ||
    profile.email.split("@")[0] ||
    "User";

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-10 xl:px-40">
      <header className="flex justify-center py-10 sm:py-14 lg:py-20">
        <h1
          className="text-center"
          style={{
            fontFamily: commerceTypography.fontFamily.heading,
            fontSize: "clamp(2rem, 5vw, 54px)",
            fontWeight: commerceTypography.fontWeight.medium,
            lineHeight: "110%",
            letterSpacing: "-1px",
            color: commerceColors.text.primary,
          }}
        >
          My Account
        </h1>
      </header>

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-16 xl:gap-[72px]">
        <AccountSidebar
          displayName={profile.displayName}
          email={profile.email}
          imageUrl={profile.imageUrl}
        />
        <div className="min-w-0 flex-1">
          <MyReviewsSection
            reviews={reviews.items}
            totalCount={reviews.totalCount}
            totalPages={reviews.totalPages}
            currentPage={reviews.page}
            currentUserId={user.id}
            authorName={authorName}
            avatarUrl={profile.imageUrl}
          />
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
