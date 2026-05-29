import { haptic } from '../../utils/haptic';

interface PreviewModeBannerProps {
  isPreviewMode: boolean;
  onExitPreview: () => void;
}

export function PreviewModeBanner({ isPreviewMode, onExitPreview }: PreviewModeBannerProps) {
  // ИСПРАВЛЕНО: Если это реальный клиент (isPreviewMode === false), скрываем баннер
  if (!isPreviewMode) return null;

  return (
    <div className="bg-amber-500 text-white text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-xl flex justify-between items-center shadow-xs animate-fadeIn">
      <span>👀 Режим просмотра витрины</span>
      <button
        type="button"
        onClick={() => {
          haptic.impact('medium');
          onExitPreview();
        }}
        className="bg-white text-amber-600 px-2.5 py-1 rounded-lg font-bold normal-case active:scale-95 transition-all shadow-xs"
      >
        Выйти
      </button>
    </div>
  );
}
