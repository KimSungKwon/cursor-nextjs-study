import { requireAdminAccess } from "@/lib/auth/admin";

const AdminProductsPage = async () => {
  await requireAdminAccess();

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">상품 관리</h1>
      <p className="text-zinc-600">관리자 상품 관리 placeholder</p>
    </main>
  );
};

export default AdminProductsPage;
