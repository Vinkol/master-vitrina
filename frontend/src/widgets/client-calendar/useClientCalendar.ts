import { useEffect, useMemo, useState, type RefObject } from 'react';
import { generateCalendarRange } from '../../shared/lib/calendar/calendarCore';

interface UseClientCalendarOptions {
  scrollRef: RefObject<HTMLDivElement | null>;
}

export function useClientCalendar({ scrollRef }: UseClientCalendarOptions) {
  const monthsGroup = useMemo(() => generateCalendarRange(0, 12), []);

  const [currentVisibleMonth, setCurrentVisibleMonth] = useState<string>(
    () => monthsGroup[0]?.monthName || 'Календарь',
  );

  const todayIso = useMemo(() => {
    const d = new Date();
    const utcYear = d.getUTCFullYear();
    const utcMonth = String(d.getUTCMonth() + 1).padStart(2, '0');
    const utcDay = String(d.getUTCDate()).padStart(2, '0');
    return `${utcYear}-${utcMonth}-${utcDay}`;
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observerOptions = {
      root: container,
      rootMargin: '0px -30% 0px -30%',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const monthName = entry.target.getAttribute('data-month-name');
          if (monthName) setCurrentVisibleMonth(monthName);
        }
      });
    }, observerOptions);

    const monthBlocks = container.querySelectorAll('.month-carousel-block');
    monthBlocks.forEach((block) => observer.observe(block));

    return () => {
      monthBlocks.forEach((block) => observer.unobserve(block));
      observer.disconnect();
    };
  }, [monthsGroup, scrollRef]);

  return {
    monthsGroup,
    currentVisibleMonth,
    todayIso,
  };
}
