"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/commons/hooks/useAuth";
import { useCartStore } from "@/commons/store/cart-store";

const mergeFlagKey = (userId: string) => `commerce_cart_merged_${userId}`;

/**
 * localStorage 복원 후, 로그인 상태면 서버 장바구니와 동기화한다.
 * 세션당 1회만 로컬→서버 merge를 수행해 수량 중복 합산을 방지한다.
 */
export const useInitCart = () => {
  const { isAuthenticated, isLoading, currentUserId } = useAuth();
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const syncWithServer = useCartStore((state) => state.syncWithServer);
  const setHasHydrated = useCartStore((state) => state.setHasHydrated);
  const syncingRef = useRef(false);

  // persist hydrate 완료를 확실히 감지 (SSR/타이밍 이슈 대비 폴백 포함)
  useEffect(() => {
    const markHydrated = () => {
      setHasHydrated(true);
    };

    const unsub = useCartStore.persist.onFinishHydration(markHydrated);

    if (useCartStore.persist.hasHydrated()) {
      markHydrated();
    } else {
      // 일부 환경에서 onFinishHydration이 누락될 수 있어 강제 rehydrate
      void useCartStore.persist.rehydrate().then(markHydrated);
    }

    // 최종 폴백: 다음 틱에도 미완료면 화면이 멈추지 않도록 표시
    const fallbackId = window.setTimeout(markHydrated, 100);

    return () => {
      unsub();
      window.clearTimeout(fallbackId);
    };
  }, [setHasHydrated]);

  useEffect(() => {
    if (!hasHydrated || isLoading || syncingRef.current) {
      return;
    }

    if (!isAuthenticated || !currentUserId) {
      return;
    }

    const flagKey = mergeFlagKey(currentUserId);
    const alreadyMerged =
      typeof window !== "undefined" &&
      sessionStorage.getItem(flagKey) === "1";

    syncingRef.current = true;

    void syncWithServer({ mergeLocal: !alreadyMerged })
      .then(() => {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(flagKey, "1");
        }
      })
      .catch(() => {
        // 동기화 실패 시 로컬 장바구니 유지
      })
      .finally(() => {
        syncingRef.current = false;
      });
  }, [
    hasHydrated,
    isAuthenticated,
    isLoading,
    currentUserId,
    syncWithServer,
  ]);
};
