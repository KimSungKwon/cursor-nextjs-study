"use client";

import { useEffect, useRef } from "react";

type UseInfiniteScrollOptions = {
  onLoadMore: () => void;
  enabled?: boolean;
  rootMargin?: string;
  threshold?: number;
};

/**
 * Intersection Observer 기반 무한 스크롤 훅
 * sentinel 요소가 뷰포트에 들어오면 onLoadMore를 호출한다.
 */
export function useInfiniteScroll({
  onLoadMore,
  enabled = true,
  rootMargin = "200px",
  threshold = 0,
}: UseInfiniteScrollOptions) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          onLoadMoreRef.current();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, rootMargin, threshold]);

  return loadMoreRef;
}
