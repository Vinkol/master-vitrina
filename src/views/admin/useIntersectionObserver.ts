import { useEffect, type RefObject } from 'react';

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
  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoading && hasMore) {
          onLoadMore();
        }
      },
      { root: null, rootMargin: '150px', threshold: 0 },
    );

    observer.observe(trigger);

    return () => {
      observer.unobserve(trigger);
      observer.disconnect();
    };
  }, [triggerRef, isLoading, hasMore, onLoadMore]);
}
