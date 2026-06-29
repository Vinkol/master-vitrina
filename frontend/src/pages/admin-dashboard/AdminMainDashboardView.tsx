import { useAdminDashboard } from './useAdminDashboard';
import { DashboardHeader } from '../../components/admin/DashboardHeader';
import { ManualBookingModal } from '../../features/manual-booking/ManualBookingModal';
import { haptic } from '../../shared/lib/haptic/haptic';
import { CalendarRibbon } from '../../widgets/admin-calendar/CalendarRibbon';
import { formatToUserDate } from '../../shared/lib/calendar/dateFormatter';
import { AppointmentRow } from '../../entities/appointment/AppointmentRow';
import { MonthCalendarSheet } from '../../widgets/admin-calendar/MonthCalendarSheet';
import { PlusCircle, Link2, CalendarX } from 'lucide-react';
import { AppointmentRowSkeleton } from '../../entities/appointment/AppointmentRowSkeleton';

export function AdminMainDashboardView() {
  const dashboard = useAdminDashboard();

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-5 bg-slate-50 min-h-screen text-slate-800 pb-28 select-none animate-fadeIn">
      {/* 1. ШАПКА ПАНЕЛИ С ВЫБОРОМ МЕСЯЦА */}
      <DashboardHeader
        visibleMonth={dashboard.visibleMonth}
        onOpenMonthModal={() => {
          haptic.impact('medium');
          dashboard.setIsMonthModalOpen(true);
        }}
      />

      {/* 2. ЛЕНТА КАЛЕНДАРЯ КАРУСЕЛИ */}
      <CalendarRibbon
        scrollRef={dashboard.scrollRef}
        daysList={dashboard.daysList}
        selectedDate={dashboard.selectedDate}
        todayIso={dashboard.todayIso}
        appointments={dashboard.appointments}
        onDaySelect={dashboard.handleDaySelect}
      />

      {/* БЫСТРЫЕ ДЕЙСТВИЯ МАСТЕРА */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            haptic.impact('light');
            dashboard.setIsManualBookingOpen(true);
          }}
          className="flex flex-col items-start p-4 bg-linear-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl shadow-sm active:scale-98 transition-all group cursor-pointer"
        >
          <div className="p-2 bg-white/15 rounded-xl mb-3 backdrop-blur-xs text-white shrink-0">
            <PlusCircle className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <span className="text-xs font-black leading-tight">Записать вручную</span>
          <span className="text-[9px] text-indigo-100 mt-0.5">Клиент позвонил сам</span>
        </button>

        <button
          onClick={() => {
            haptic.impact('light');
            dashboard.setScreen('admin-link-share');
          }}
          className="flex flex-col items-start p-4 bg-white border border-slate-200/80 text-slate-800 rounded-2xl shadow-xs active:scale-98 transition-all group cursor-pointer"
        >
          <div className="p-2 bg-slate-50 border border-slate-100 text-slate-500 rounded-xl mb-3 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
            <Link2 className="w-5 h-5" strokeWidth={2} />
          </div>
          <span className="text-xs font-black leading-tight">Ссылка на запись</span>
          <span className="text-[9px] text-slate-400 mt-0.5">Поделиться витриной</span>
        </button>
      </div>

      {/* СПИСОК ЗАПИСЕЙ НА ТЕКУЩИЙ ДЕНЬ */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Записи на{' '}
            {dashboard.selectedDate === dashboard.todayIso
              ? 'сегодня'
              : formatToUserDate(dashboard.selectedDate)}
          </h3>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
            Всего: {dashboard.filteredAppointments.length}
          </span>
        </div>

        {dashboard.isLoading && dashboard.appointments.length === 0 ? (
          <div className="space-y-2">
            <AppointmentRowSkeleton />
            <AppointmentRowSkeleton />
            <AppointmentRowSkeleton />
          </div>
        ) : dashboard.filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white border border-dashed border-slate-200 rounded-2xl text-center">
            <div className="p-3 bg-slate-50 text-slate-300 rounded-full mb-2 shrink-0">
              <CalendarX className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <p className="text-xs font-bold text-slate-400">На этот день записей нет</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dashboard.filteredAppointments.map((app) => (
              <AppointmentRow key={app.id} appointment={app} />
            ))}
          </div>
        )}
      </div>

      {/* ИНТЕРАКТИВНАЯ ШТОРКА КАЛЕНДАРЯ НА МЕСЯЦ */}
      <MonthCalendarSheet
        isOpen={dashboard.isMonthModalOpen}
        onClose={() => dashboard.setIsMonthModalOpen(false)}
        selectedDate={dashboard.selectedDate}
        appointments={dashboard.appointments}
        onDateSelect={dashboard.handleMonthDateSelect}
      />

      {/* МОДАЛКА РУЧНОЙ ЗАПИСИ КЛИЕНТА */}
      <ManualBookingModal
        isOpen={dashboard.isManualBookingOpen}
        onClose={() => dashboard.setIsManualBookingOpen(false)}
        selectedDate={dashboard.selectedDate}
      />
    </div>
  );
}
