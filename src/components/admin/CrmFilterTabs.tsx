import { memo } from 'react';
import type { CrmFilter } from '../../views/admin/useClientsCrm';
import { haptic } from '../../utils/haptic';

const FILTER_TABS: { id: CrmFilter; label: string; icon: string }[] = [
  { id: 'all', label: 'Все', icon: '👥' },
  { id: 'new', label: 'Новые', icon: '🌱' },
  { id: 'loyal', label: 'Постоянные', icon: '👑' },
  { id: 'active', label: 'Активные', icon: '⚡' },
  { id: 'blocked', label: 'Чёрный список', icon: '🚫' },
];

interface CrmFilterTabsProps {
  activeFilter: CrmFilter;
  onChange: (filterId: CrmFilter) => void;
}

export const CrmFilterTabs = memo(function CrmFilterTabs({
  activeFilter,
  onChange,
}: CrmFilterTabsProps) {
  const handleFilterChange = (filterId: CrmFilter) => {
    haptic.impact('light');
    onChange(filterId);
  };

  return (
    <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
      {FILTER_TABS.map((tab) => {
        const isActive = activeFilter === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleFilterChange(tab.id)}
            className={`shrink-0 py-2 px-3.5 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all active:scale-95 flex items-center space-x-1.5 ${
              isActive
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
});
