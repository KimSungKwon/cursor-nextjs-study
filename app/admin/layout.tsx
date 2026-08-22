import type { ReactNode } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout/AdminLayout";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAccess } from "@/lib/auth/admin";

async function getAdminEmail(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return "";
  }

  const { data } = await supabase
    .from("users")
    .select("email")
    .eq("id", user.id)
    .maybeSingle();

  const row = data as { email?: string } | null;
  return row?.email ?? user.email ?? "";
}

const AdminRootLayout = async ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  await requireAdminAccess();
  const email = await getAdminEmail();

  return <AdminLayout email={email}>{children}</AdminLayout>;
};

export default AdminRootLayout;
