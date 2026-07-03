import { haptic } from '../../shared/lib/haptic/haptic';
import { PageHeader } from '../../shared/ui/page-header/PageHeader';
import { useBookingStore } from '../../store/useBookingStore';
import { Copy, Send } from 'lucide-react';

export function AdminLinkShareView() {
  const currentMasterId = useBookingStore((state) => state.currentMasterId);
  const botUsername = useBookingStore((state) => state.botUsername) || 'mastervitrinabot';
  const botAppName = useBookingStore((state) => state.botAppName) || 'app';
  const setScreen = useBookingStore((state) => state.setScreen);

  const clientLink = `https://t.me/${botUsername}/${botAppName}?startapp=${currentMasterId || ''}`;

  const handleShareInTelegram = () => {
    haptic.impact('medium');
    const shareMessage = `Привет! По этой ссылке можно посмотреть мои услуги и записаться онлайн в пару кликов:`;

    const tgShareUrl = `https://t.me/share/url?url=${encodeURIComponent(clientLink)}&text=${encodeURIComponent(shareMessage)}`;

    if (window.Telegram?.WebApp?.openTelegramLink) {
      try {
        window.Telegram.WebApp.openTelegramLink(tgShareUrl);
      } catch (err) {
        console.error('Нативный шеринг не сработал, открываем через вкладку:', err);
        window.open(tgShareUrl, '_blank');
      }
    } else {
      window.open(tgShareUrl, '_blank');
    }
  };

  const handleCopyLink = () => {
    haptic.impact('light');
    void navigator.clipboard.writeText(clientLink).then(() => {
      if (window.Telegram?.WebApp?.showAlert) {
        window.Telegram.WebApp.showAlert('Ссылка скопирована в буфер обмена!');
      } else {
        alert('Ссылка скопирована в буфер обмена!');
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-5 bg-slate-50 min-h-screen text-slate-800 pb-24 select-none animate-fadeIn">
      <PageHeader
        title="Ссылка для записи"
        subtitle="Ваша персональная ссылка"
        onBackClick={() => setScreen('admin-placeholder-main')}
      />

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

        <div className="flex flex-col space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60 font-mono text-[11px] text-slate-500 break-all select-all">
          {clientLink}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center space-x-1.5 p-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 active:scale-95 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer group"
          >
            <Copy
              className="w-3.5 h-3.5 text-slate-500 group-hover:scale-105 transition-transform"
              strokeWidth={2.2}
            />
            <span>Копировать</span>
          </button>

          <button
            onClick={handleShareInTelegram}
            className="flex items-center justify-center space-x-1.5 p-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer group"
          >
            <Send
              className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              strokeWidth={2.2}
            />
            <span>Отправить в ТГ</span>
          </button>
        </div>
      </div>

      <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/40 text-left">
        <p className="text-[11px] text-indigo-900 font-semibold leading-relaxed">
          💡 Клиенту не нужно ничего скачивать. Ссылка откроет приложение прямо поверх вашего чата.
        </p>
      </div>
    </div>
  );
}
