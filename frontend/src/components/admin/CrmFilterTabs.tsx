import { memo } from 'react';
import type { CrmFilter } from '../../pages/admin-clients/useClientsCrm';
import { haptic } from '../../shared/lib/haptic/haptic';
import { Users, UserPlus, Crown, Zap, Ban, type LucideIcon } from 'lucide-react';

const FILTER_TABS: {
  id: CrmFilter;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: 'all', label: 'Все', icon: Users },
  { id: 'new', label: 'Новые', icon: UserPlus },
  { id: 'loyal', label: 'Постоянные', icon: Crown },
  { id: 'active', label: 'Активные', icon: Zap },
  { id: 'blocked', label: 'Чёрный список', icon: Ban },
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
    <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none px-1">
      {FILTER_TABS.map((tab) => {
        const isActive = activeFilter === tab.id;
        const IconComponent = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleFilterChange(tab.id)}
            className={`shrink-0 py-2 px-3.5 rounded-xl text-xs font-bold border transition-all active:scale-95 flex items-center space-x-1.5 cursor-pointer ${
              isActive
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                : 'bg-white border-slate-200/60 text-slate-500 hover:border-slate-300'
            }`}
          >
            <IconComponent className="w-3.5 h-3.5" strokeWidth={isActive ? 2.5 : 2} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
});
