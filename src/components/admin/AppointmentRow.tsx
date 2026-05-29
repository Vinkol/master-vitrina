import type { Appointment } from '../../types';

interface AppointmentRowProps {
  appointment: Appointment;
}

export function AppointmentRow({ appointment }: AppointmentRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-slate-200 transition-colors animate-fadeIn">
      <div className="flex items-center space-x-3">
        <div className="bg-slate-50 p-2.5 rounded-xl text-center min-w-13.75 border border-slate-100">
          <span className="text-sm font-black text-slate-800 block">{appointment.time}</span>
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-800">{appointment.client_name}</h4>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
            Услуга: {appointment.service_title}
          </p>
        </div>
      </div>
    </div>
  );
}
