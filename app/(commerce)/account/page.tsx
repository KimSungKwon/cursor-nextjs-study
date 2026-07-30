"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AUTH_URLS } from "@/commons/constants/url";
import { useAuth } from "@/commons/hooks/useAuth";
import { Button } from "@/components/ui/Button";

const AccountPage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push(AUTH_URLS.LOGIN);
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">마이페이지</h1>
      <p className="text-zinc-600">계정 페이지 placeholder</p>

      {!isLoading && isAuthenticated ? (
        <div className="mt-4 flex flex-col items-start gap-3">
          {user?.email ? (
            <p className="text-sm text-zinc-500">{user.email}</p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSigningOut}
            onClick={() => {
              void handleSignOut();
            }}
          >
            {isSigningOut ? "로그아웃 중..." : "로그아웃"}
          </Button>
        </div>
      ) : null}
    </main>
  );
};

export default AccountPage;
