import { redirect } from "next/navigation";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { AUTH_URLS } from "@/commons/constants/url";
import { AccountDetailsForm } from "@/components/account/AccountDetailsForm";
import { AccountSidebar } from "@/components/account/AccountSidebar/AccountSidebar";
import { createClient } from "@/lib/supabase/server";

type UsersProfileRow = {
  display_name: string | null;
  email: string;
  role: string;
  image_url: string | null;
};

const AccountPage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(AUTH_URLS.LOGIN);
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("display_name, email, role, image_url")
    .eq("id", user.id)
    .single();

  const profileRow = profile as UsersProfileRow | null;

  const email =
    !profileError && profileRow?.email
      ? profileRow.email
      : (user.email ?? "");

  const displayName =
    !profileError && profileRow
      ? profileRow.display_name
      : null;

  const imageUrl =
    !profileError && profileRow ? profileRow.image_url : null;

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
          displayName={displayName}
          email={email}
          imageUrl={imageUrl}
        />
        <div className="min-w-0 flex-1 lg:pt-0">
          <AccountDetailsForm
            initialDisplayName={displayName}
            email={email}
          />
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
