export function getStartParam(): string | null {
  const tg = window.Telegram?.WebApp;

  const tgParam = tg?.initDataUnsafe?.start_param;

  const urlParams = new URLSearchParams(window.location.search);

  return tgParam || urlParams.get('startapp') || urlParams.get('tgWebAppStartParam');
}
