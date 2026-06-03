import { useAdminDashboard } from './useAdminDashboard';
import { DashboardHeader } from '../../components/admin/DashboardHeader';
import { CalendarRibbon } from '../../components/admin/CalendarRibbon';
import { AppointmentRow } from '../../components/admin/AppointmentRow';
import { ManualBookingModal } from '../../features/manual-booking/ManualBookingModal';
import { MonthCalendarSheet } from '../../components/admin/MonthCalendarSheet';
import { formatToUserDate } from '../../utils/dateFormatter';
import { haptic } from '../../utils/haptic';

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
          <div className="p-2 bg-white/20 rounded-xl mb-3 text-lg">📝</div>
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
          <div className="p-2 bg-slate-100 rounded-xl mb-3 text-lg">🔗</div>
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

        {dashboard.filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white border border-dashed border-slate-200 rounded-2xl text-center">
            <span className="text-2xl mb-2">🍃</span>
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
