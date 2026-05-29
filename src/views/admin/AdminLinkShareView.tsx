import { useBookingStore } from '../../store/bookingStore';
import { haptic } from '../../utils/haptic';

export function AdminLinkShareView() {
  const currentMasterId = useBookingStore((state) => state.currentMasterId);
  const botUsername = useBookingStore((state) => state.botUsername) || 'mastervitrinabot';
  const botAppName = useBookingStore((state) => state.botAppName) || 'app';
  const setScreen = useBookingStore((state) => state.setScreen);

  // Собираем правильную официальную ссылку для Mini App
  const clientLink = `https://t.me/${botUsername}/${botAppName}?startapp=${currentMasterId || ''}`;

  // ИСПРАВЛЕНО: Официальный и стабильный нативный шеринг внутри Telegram
  const handleShareInTelegram = () => {
    haptic.impact('medium');
    const shareMessage = `Привет! По этой ссылке можно посмотреть мои услуги и записаться онлайн в пару кликов:`;

    // Используем правильный endpoint /share/url для открытия нативного окна пересылки
    const tgShareUrl = `https://t.me{encodeURIComponent(clientLink)}&text=${encodeURIComponent(shareMessage)}`;

    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(tgShareUrl);
    } else {
      window.open(tgShareUrl, '_blank');
    }
  };

  const handleCopyLink = () => {
    haptic.impact('light');
    navigator.clipboard.writeText(clientLink).then(() => {
      if (window.Telegram?.WebApp?.showAlert) {
        window.Telegram.WebApp.showAlert('Ссылка скопирована в буфер обмена!');
      } else {
        alert('Ссылка скопирована в буфер обмена!');
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-5 bg-slate-50 min-h-screen text-slate-800 pb-24 select-none animate-fadeIn">
      {/* Кнопка назад и заголовок */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => {
            haptic.impact('light');
            setScreen('admin-dashboard');
          }}
          className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm text-slate-400 active:scale-95 transition-all text-sm font-bold"
        >
          ← Назад
        </button>
        <div>
          <h2 className="text-base font-black text-slate-800">Ссылка для записи</h2>
          <p className="text-[10px] text-slate-400 font-medium">Ваша персональная витрина</p>
        </div>
      </div>

      {/* Карточка с основной информацией */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Ссылка активна
          </h3>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-medium">
          Поделитесь этой ссылкой в Instagram, отправьте в чаты или отправляйте клиентам напрямую.
          При переходе они моментально попадут на ваш профиль.
        </p>

        {/* Поле с ссылкой */}
        <div className="flex flex-col space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60 font-mono text-[11px] text-slate-500 break-all select-all">
          {clientLink}
        </div>

        {/* Кнопки действий */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleCopyLink}
            className="p-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm text-center"
          >
            📋 Копировать
          </button>

          <button
            onClick={handleShareInTelegram}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm text-center"
          >
            ✈️ Отправить в ТГ
          </button>
        </div>
      </div>

      {/* Короткая памятка для мастера */}
      <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/40 text-left">
        <p className="text-[11px] text-indigo-900 font-semibold leading-relaxed">
          💡 Клиенту не нужно ничего скачивать. Ссылка откроет приложение прямо поверх вашего чата.
        </p>
      </div>
    </div>
  );
}
