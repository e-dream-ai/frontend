import { useCallback, useEffect, useRef, useState } from "react";

interface Options {
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  rootMargin?: string;
}

export function useInfiniteScrollSentinel<
  TRoot extends HTMLElement = HTMLDivElement,
>({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  rootMargin = "150px",
}: Options) {
  const rootRef = useRef<TRoot>(null);
  const [sentinel, setSentinel] = useState<HTMLElement | null>(null);
  const sentinelRef = useCallback(
    (node: HTMLElement | null) => setSentinel(node),
    [],
  );

  const paging = useRef({ hasNextPage, isFetchingNextPage, fetchNextPage });
  useEffect(() => {
    paging.current = { hasNextPage, isFetchingNextPage, fetchNextPage };
  });

  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        const { hasNextPage, isFetchingNextPage, fetchNextPage } =
          paging.current;
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { root: rootRef.current, rootMargin },
    );
    observer.observe(sentinel);
    observerRef.current = observer;
    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [sentinel, rootMargin]);

  const wasFetching = useRef(isFetchingNextPage);
  useEffect(() => {
    const settled = wasFetching.current && !isFetchingNextPage;
    wasFetching.current = isFetchingNextPage;
    if (!settled || !sentinel) return;
    observerRef.current?.unobserve(sentinel);
    observerRef.current?.observe(sentinel);
  }, [isFetchingNextPage, sentinel]);

  return { rootRef, sentinelRef };
}
