import { redirect } from "next/navigation";
import { AccountSidebar } from "@/components/account/AccountSidebar/AccountSidebar";
import { OrdersTable } from "@/components/account/OrdersTable";
import {
  ORDERS_PAGE_SIZE,
  isOrderStatus,
  type AccountOrder,
  type OrdersListResult,
} from "@/components/account/orders/types";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS, AUTH_URLS } from "@/commons/constants/url";
import { createClient } from "@/lib/supabase/server";

type OrdersPageProps = {
  searchParams: Promise<{ page?: string }>;
};

type UsersProfileRow = {
  display_name: string | null;
  email: string;
  role: string;
  image_url: string | null;
};

type OrderRow = {
  id: string;
  created_at: string;
  status: string;
  total_amount: number | string;
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

function mapOrderRow(row: OrderRow): AccountOrder {
  return {
    id: row.id,
    createdAt: row.created_at,
    status: isOrderStatus(row.status) ? row.status : "pending",
    totalAmount: toSafeNumber(row.total_amount),
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

async function getOrders(
  supabase: SupabaseServerClient,
  userId: string,
  page: number,
): Promise<OrdersListResult> {
  const from = (page - 1) * ORDERS_PAGE_SIZE;
  const to = from + ORDERS_PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("orders")
    .select("id, created_at, status, total_amount", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`주문 목록 조회 실패: ${error.message}`);
  }

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / ORDERS_PAGE_SIZE));
  const items = ((data as OrderRow[] | null) ?? []).map(mapOrderRow);

  return {
    items,
    totalCount,
    page,
    totalPages: totalCount === 0 ? 1 : totalPages,
  };
}

/**
 * 마이페이지 주문 내역 — AccountSidebar + OrdersTable + Pagination
 */
const OrdersPage = async ({ searchParams }: OrdersPageProps) => {
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

  const [profile, orders] = await Promise.all([
    getUserProfile(supabase, user.id, user.email ?? ""),
    getOrders(supabase, user.id, requestedPage),
  ]);

  if (orders.totalCount === 0 && requestedPage > 1) {
    redirect(ACCOUNT_URLS.ORDERS);
  }

  if (orders.totalCount > 0 && requestedPage > orders.totalPages) {
    redirect(`${ACCOUNT_URLS.ORDERS}?page=${orders.totalPages}`);
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
          imageUrl={profile.imageUrl}
        />
        <div className="min-w-0 flex-1">
          <OrdersTable
            items={orders.items}
            totalCount={orders.totalCount}
            page={orders.page}
            totalPages={orders.totalPages}
          />
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
