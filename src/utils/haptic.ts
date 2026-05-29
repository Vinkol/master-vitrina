/* Утилита для работы с нативным тактильным откликом Telegram WebApp HapticFeedback */
export const haptic = {
  /* Легкий, средний или жесткий виброотклик при кликах и тапах */
  impact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light'): void {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  },
  /* Виброотклик для уведомлений (успех, ошибка, предупреждение) */
  notification(type: 'success' | 'error' | 'warning'): void {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
    }
  },
  /* Легкая вибрация при изменении выбора в списках/барабанах */
  selection(): void {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  },
};
