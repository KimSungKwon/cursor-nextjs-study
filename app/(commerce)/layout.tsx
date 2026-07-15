import { LayoutHeader } from "@/components/commerce/layout/LayoutHeader";

const CommerceLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--commerce-background-default)]">
      <LayoutHeader />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
};

export default CommerceLayout;
