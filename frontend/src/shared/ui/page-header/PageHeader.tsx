import type { ReactNode } from 'react';
import { haptic } from '../../lib/haptic/haptic';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  onBackClick: () => void;
  onSaveClick?: () => void;
  saveButtonText?: string;
  isSaving?: boolean;
  rightAction?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  onBackClick,
  onSaveClick,
  saveButtonText = 'Сохранить',
  isSaving = false,
  rightAction,
}: PageHeaderProps) {
  const handleBack = () => {
    haptic.impact('light');
    onBackClick();
  };

  const handleSave = () => {
    if (onSaveClick && !isSaving) {
      haptic.impact('medium');
      onSaveClick();
    }
  };

  return (
    <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200/60 sticky top-2 z-10 shadow-xs animate-fadeIn">
      <div className="flex items-center space-x-2 min-w-0">
        <button
          type="button"
          onClick={handleBack}
          className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 text-slate-400 font-bold active:scale-95 transition-all text-xs shrink-0"
        >
          ← Назад
        </button>
        <div className="min-w-0">
          <h2 className="text-sm font-black text-slate-800 leading-tight truncate">{title}</h2>
          <p className="text-[10px] text-slate-400 font-medium">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        {onSaveClick && (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-md active:scale-98 ${
              isSaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? 'Сохранение...' : saveButtonText}
          </button>
        )}
        {!onSaveClick && rightAction && rightAction}
      </div>
    </div>
  );
}
