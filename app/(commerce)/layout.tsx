import { LayoutFooter } from "@/components/commerce/layout/LayoutFooter";
import { LayoutHeader } from "@/components/commerce/layout/LayoutHeader";
import { SearchOverlay } from "@/features/search/components/SearchOverlay";

const CommerceLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--commerce-background-default)]">
      <LayoutHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <LayoutFooter />
      <SearchOverlay />
    </div>
  );
};

export default CommerceLayout;
