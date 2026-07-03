import { useEffect, useRef, type RefObject } from 'react';

interface UseIntersectionObserverProps {
  triggerRef: RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function useIntersectionObserver({
  triggerRef,
  isLoading,
  hasMore,
  onLoadMore,
}: UseIntersectionObserverProps) {
  const isLoadingRef = useRef(isLoading);
  const hasMoreRef = useRef(hasMore);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    isLoadingRef.current = isLoading;
    hasMoreRef.current = hasMore;
    onLoadMoreRef.current = onLoadMore;
  }, [isLoading, hasMore, onLoadMore]);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoadingRef.current && hasMoreRef.current) {
          onLoadMoreRef.current();
        }
      },
      { root: null, rootMargin: '150px', threshold: 0 },
    );

    observer.observe(trigger);

    return () => {
      observer.unobserve(trigger);
      observer.disconnect();
    };
  }, [triggerRef]);
}
