import { useState } from 'react'; // Добавили стейт для нашей модалки
import type { Appointment } from '../../types';
import { useAppointments } from '../../features/appointments/useAppointments';
import { haptic } from '../../shared/lib/haptic/haptic';
import { Trash2, AlertTriangle } from 'lucide-react'; // Импортируем иконки

interface AppointmentRowProps {
  appointment: Appointment;
}

export function AppointmentRow({ appointment }: AppointmentRowProps) {
  const { deleteAppointment, isDeleting } = useAppointments();
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  const handleOpenConfirm = () => {
    haptic.impact('medium');
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    haptic.impact('light');
    setIsConfirmOpen(false);
  };

  const handleExecuteDelete = async () => {
    haptic.notification('success');
    setIsConfirmOpen(false);
    await deleteAppointment(appointment.id);
  };

  return (
    <>
      {/* ОСНОВНАЯ КАРТОЧКА ЗАПИСИ */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-slate-200 transition-colors anonymity animate-fadeIn">
        <div className="flex items-center space-x-3">
          <div className="bg-slate-50 p-2.5 rounded-xl text-center min-w-13.75 border border-slate-100">
            <span className="text-sm font-black text-slate-800 block">{appointment.time}</span>
          </div>
          <div className="text-left">
            <h4 className="text-xs font-black text-slate-800">{appointment.client_name}</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
              Услуга: {appointment.service_title}
            </p>
          </div>
        </div>

        {/* Наша кнопка отмены */}
        <button
          type="button"
          disabled={isDeleting}
          onClick={handleOpenConfirm}
          className={`p-2.5 rounded-xl border border-rose-50 bg-rose-50/40 text-rose-500 hover:bg-rose-50 hover:text-rose-600 active:scale-90 transition-all cursor-pointer ${
            isDeleting ? 'opacity-40 cursor-not-allowed' : ''
          }`}
          title="Отменить запись"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* МОДАЛКА ПОДТВЕРЖДЕНИЯ */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          {/* Клик по фону закроет окно */}
          <div className="absolute inset-0" onClick={handleCloseConfirm} />
          {/* Тело модалки */}
          <div className="bg-white w-full max-w-xs rounded-2xl p-5 relative z-10 animate-scaleUp shadow-2xl border border-slate-100 space-y-4 text-center">
            {/* Иконка предупреждения */}
            <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 border border-rose-100/50">
              <AlertTriangle className="w-5 h-5" />
            </div>

            {/* Текст */}
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-800">Отменить запись?</h4>
              <p className="text-[11px] text-slate-400 leading-normal px-1">
                Вы уверены, что хотите удалить запись клиента{' '}
                <span className="font-bold text-slate-600">{appointment.client_name}</span> на{' '}
                <span className="font-bold text-slate-600">{appointment.time}</span>? Окошко снова
                станет свободным.
              </p>
            </div>

            {/* Кнопки действий */}
            <div className="flex space-x-2 pt-1.5">
              <button
                type="button"
                onClick={handleCloseConfirm}
                className="w-1/2 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-2.5 rounded-xl border border-slate-200/60 transition-all text-xs active:scale-95"
              >
                Нет, оставить
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleExecuteDelete();
                }}
                className="w-1/2 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-rose-100 text-xs active:scale-95"
              >
                Да, отменить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
