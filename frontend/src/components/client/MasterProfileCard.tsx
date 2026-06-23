import type { MasterProfile } from '../../types';
import { User, Clock } from 'lucide-react';

interface MasterProfileCardProps {
  profile: MasterProfile;
  workingHoursLabel: string;
}

export function MasterProfileCard({ profile, workingHoursLabel }: MasterProfileCardProps) {
  const isWeekend = workingHoursLabel === 'Сегодня выходной';

  return (
    <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-indigo-500 to-purple-500" />

      <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-inner border-2 border-white mt-2 overflow-hidden bg-slate-100">
        {profile.avatar?.startsWith('data:image') ? (
          <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
        ) : (
          <User className="w-9 h-9 text-slate-300" strokeWidth={1.5} />
        )}
      </div>

      <h2 className="text-xl font-black mt-3 text-slate-800">{profile.name || 'Мастер'}</h2>

      {profile.bio && (
        <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed font-medium">
          {profile.bio}
        </p>
      )}

      <div className="mt-4 pt-3 border-t border-slate-50 flex justify-center items-center space-x-2 text-[11px] text-slate-400 font-bold uppercase tracking-wide">
        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={2} />
        <span>Время работы сегодня:</span>
        <span
          className={`px-2.5 py-0.5 rounded-md normal-case font-extrabold transition-all ${
            isWeekend
              ? 'text-rose-600 bg-rose-50 border border-rose-100/30'
              : 'text-indigo-600 bg-indigo-50'
          }`}
        >
          {workingHoursLabel}
        </span>
      </div>
    </div>
  );
}
