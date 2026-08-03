import { redirect } from "next/navigation";
import { AccountSidebar } from "@/components/account/AccountSidebar/AccountSidebar";
import { LikeListSection } from "@/components/account/LikeListSection/LikeListSection";
import {
  WISHLIST_PAGE_SIZE,
  type WishlistItem,
  type WishlistListResult,
  type WishlistProduct,
} from "@/components/account/wishlist/types";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS, AUTH_URLS } from "@/commons/constants/url";
import type { ProductStatus } from "@/commons/types/product";
import { createClient } from "@/lib/supabase/server";

type WishlistPageProps = {
  searchParams: Promise<{ page?: string }>;
};

type UsersProfileRow = {
  display_name: string | null;
  email: string;
  role: string;
};

type LikedProductRow = {
  id: string;
  name: string;
  price: number | string;
  sale_price: number | string | null;
  image_url: string | null;
  status: string;
};

type LikeItemJoinRow = {
  id: string;
  created_at: string;
  product_id: string;
  products: LikedProductRow | LikedProductRow[] | null;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

function parsePage(raw: string | undefined): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
}

function toProductStatus(status: string): ProductStatus {
  if (status === "sold_out" || status === "hidden" || status === "registered") {
    return status;
  }
  return "registered";
}

function toSafeNumber(value: number | string | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapProduct(row: LikedProductRow): WishlistProduct {
  return {
    id: row.id,
    name: row.name,
    price: toSafeNumber(row.price),
    salePrice:
      row.sale_price != null ? toSafeNumber(row.sale_price) : null,
    imageUrl: row.image_url,
    status: toProductStatus(row.status),
  };
}

function normalizeProduct(
  products: LikeItemJoinRow["products"],
): WishlistProduct | null {
  if (!products) {
    return null;
  }
  const row = Array.isArray(products) ? products[0] : products;
  if (!row?.id || !row.name) {
    return null;
  }
  return mapProduct(row);
}

async function getWishlistItems(
  supabase: SupabaseServerClient,
  userId: string,
  page: number,
): Promise<WishlistListResult> {
  const from = (page - 1) * WISHLIST_PAGE_SIZE;
  const to = from + WISHLIST_PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("like_items")
    .select(
      `
        id,
        created_at,
        product_id,
        products (
          id,
          name,
          price,
          sale_price,
          image_url,
          status
        )
      `,
      { count: "exact" },
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`찜 목록 조회 실패: ${error.message}`);
  }

  const totalCount = count ?? 0;
  const totalPages =
    totalCount === 0
      ? 1
      : Math.ceil(totalCount / WISHLIST_PAGE_SIZE);
  const rows = (data ?? []) as unknown as LikeItemJoinRow[];

  const items: WishlistItem[] = [];
  for (const row of rows) {
    if (!row?.id || !row.created_at) {
      continue;
    }
    const product = normalizeProduct(row.products);
    if (!product) {
      continue;
    }
    items.push({
      likeId: row.id,
      createdAt: row.created_at,
      product,
    });
  }

  return {
    items,
    totalCount,
    page,
    totalPages,
  };
}

async function getUserProfile(
  supabase: SupabaseServerClient,
  userId: string,
  fallbackEmail: string,
): Promise<{ displayName: string | null; email: string }> {
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("display_name, email, role")
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
  };
}

const WishlistPage = async ({ searchParams }: WishlistPageProps) => {
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

  const [profile, wishlist] = await Promise.all([
    getUserProfile(supabase, user.id, user.email ?? ""),
    getWishlistItems(supabase, user.id, requestedPage),
  ]);

  // 빈 목록인데 page>1 이거나, 범위를 넘는 페이지면 보정
  if (wishlist.totalCount === 0 && requestedPage > 1) {
    redirect(ACCOUNT_URLS.WISHLIST);
  }

  if (
    wishlist.totalCount > 0 &&
    requestedPage > wishlist.totalPages
  ) {
    redirect(`${ACCOUNT_URLS.WISHLIST}?page=${wishlist.totalPages}`);
  }

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
        />
        <div className="min-w-0 flex-1">
          <LikeListSection
            items={wishlist.items}
            totalCount={wishlist.totalCount}
            page={wishlist.page}
            totalPages={wishlist.totalPages}
          />
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
