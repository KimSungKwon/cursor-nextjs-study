import Link from "next/link";

type CommerceHeaderProps = {
  title?: string;
};

export const CommerceHeader = ({ title = "커머스" }: CommerceHeaderProps) => {
  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <h1 className="text-lg font-semibold">{title}</h1>
      <nav className="flex gap-4 text-sm">
        <Link href="/products">상품</Link>
        <Link href="/cart">장바구니</Link>
      </nav>
    </header>
  );
};
