import Link from "next/link";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r p-4">
        <p className="mb-4 text-sm font-semibold">관리자 대시보드</p>
        <nav className="flex flex-col gap-2 text-sm">
          <Link href="/admin">대시보드</Link>
          <Link href="/admin/products">상품 관리</Link>
          <Link href="/admin/orders">주문 관리</Link>
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
