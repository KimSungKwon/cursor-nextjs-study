import { notFound, redirect } from "next/navigation";
import { getOrderDetail } from "@/app/(commerce)/account/orders/[orderId]/queries";
import { AccountSidebar } from "@/components/account/AccountSidebar/AccountSidebar";
import { OrderDetailView } from "@/components/account/orders/OrderDetailView";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { AUTH_URLS } from "@/commons/constants/url";
import { createClient } from "@/lib/supabase/server";

type OrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
};

type UsersProfileRow = {
  display_name: string | null;
  email: string;
  role: string;
  image_url: string | null;
};

async function getUserProfile(
  userId: string,
  fallbackEmail: string,
): Promise<{
  displayName: string | null;
  email: string;
  imageUrl: string | null;
  isAdmin: boolean;
}> {
  const supabase = await createClient();
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
    isAdmin: !profileError && profileRow?.role === "admin",
  };
}

/**
 * 마이페이지 주문 상세 — 본인 주문만 조회, 없으면 404
 */
const OrderDetailPage = async ({ params }: OrderDetailPageProps) => {
  const { orderId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(AUTH_URLS.LOGIN);
  }

  const [profile, order] = await Promise.all([
    getUserProfile(user.id, user.email ?? ""),
    getOrderDetail(orderId, user.id),
  ]);

  if (!order) {
    notFound();
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
          isAdmin={profile.isAdmin}
        />
        <div className="min-w-0 flex-1">
          <OrderDetailView order={order} />
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
