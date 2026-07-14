import Link from "next/link";
import { ProductsJsonPreview } from "@/components/commerce/ProductsJsonPreview";

const CommerceHomePage = () => {
  return (
    <main className="flex flex-1 flex-col gap-8 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Commerce Dashboard</h1>
        <p className="text-zinc-600">커머스 사용자 영역의 메인 홈 페이지입니다.</p>
      </div>

      <nav className="flex flex-wrap gap-3 text-sm">
        <Link className="rounded-md border px-4 py-2" href="/products">
          상품 목록
        </Link>
        <Link className="rounded-md border px-4 py-2" href="/cart">
          장바구니
        </Link>
        <Link className="rounded-md border px-4 py-2" href="/checkout">
          결제
        </Link>
        <Link className="rounded-md border px-4 py-2" href="/account">
          마이페이지
        </Link>
      </nav>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">상품 데이터 (JSON)</h2>
        <ProductsJsonPreview />
      </section>

      <div className="flex flex-wrap gap-4 text-sm text-zinc-600">
        <Link href="/login">로그인</Link>
        <Link href="/signup">회원가입</Link>
        <Link href="/admin">관리자</Link>
      </div>
    </main>
  );
};

export default CommerceHomePage;
