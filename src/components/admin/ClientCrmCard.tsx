import { memo } from 'react';
import { haptic } from '../../utils/haptic';

// Заведем интерфейс на основе полей из кода
export interface CrmClientData {
  client_name: string;
  client_phone: string;
  is_blocked: boolean;
  visits_count: number;
  has_future_appointment: boolean;
  last_visit_date: string;
}

interface ClientCrmCardProps {
  client: CrmClientData;
  onToggleBlock: (name: string, isBlocked: boolean) => void;
}

export const ClientCrmCard = memo(function ClientCrmCard({
  client,
  onToggleBlock,
}: ClientCrmCardProps) {
  const handleToggleBlock = () => {
    haptic.impact('medium');
    onToggleBlock(client.client_name, client.is_blocked);
  };

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs flex justify-between items-center group animate-fadeIn">
      <div className="space-y-1 min-w-0 pr-4">
        <div className="flex items-center space-x-2">
          <h4 className="font-black text-slate-800 text-sm truncate">{client.client_name}</h4>

          {client.is_blocked ? (
            <span className="text-[8px] font-black uppercase tracking-wide bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded-md">
              Блок
            </span>
          ) : client.visits_count >= 3 ? (
            <span className="text-[8px] font-black uppercase tracking-wide bg-amber-50 text-amber-500 px-1.5 py-0.5 rounded-md">
              VIP
            </span>
          ) : client.visits_count === 1 ? (
            <span className="text-[8px] font-black uppercase tracking-wide bg-emerald-50 text-emerald-500 px-1.5 py-0.5 rounded-md">
              Новый
            </span>
          ) : null}

          {client.has_future_appointment && !client.is_blocked && (
            <span
              className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"
              title="Есть активная запись"
            />
          )}
        </div>

        <p className="text-[11px] text-slate-400 font-mono font-medium">{client.client_phone}</p>
        <p className="text-[10px] text-slate-400 font-medium">
          Последний визит:{' '}
          <span className="font-bold text-slate-600">{client.last_visit_date}</span>
        </p>
      </div>

      <div className="flex items-center space-x-3 shrink-0">
        <div className="text-right">
          <span className="text-xs text-slate-400 font-bold block uppercase tracking-wide">
            Визиты
          </span>
          <span className="text-base font-black text-indigo-600 block leading-tight">
            {client.visits_count}
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggleBlock}
          className={`p-2 rounded-xl border transition-all text-xs active:scale-95 ${
            client.is_blocked
              ? 'bg-rose-50 border-rose-100 text-rose-500 font-bold'
              : 'bg-slate-50 border-transparent text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100'
          }`}
          title={client.is_blocked ? 'Разблокировать' : 'В черный список'}
        >
          {client.is_blocked ? '🔓' : '🚫'}
        </button>
      </div>
    </div>
  );
});
