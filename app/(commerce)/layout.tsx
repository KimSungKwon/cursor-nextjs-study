export default function CommerceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-6 py-4">
        <p className="text-sm font-medium text-zinc-600">커머스 사용자 영역</p>
      </header>
      {children}
    </div>
  );
}
