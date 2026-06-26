export function AppointmentRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-xs animate-pulse">
      <div className="flex items-center space-x-3 w-full">
        <div className="bg-slate-100/80 rounded-xl h-11 w-14 shrink-0 border border-slate-50" />
        <div className="space-y-2 w-full pr-8">
          <div className="h-3 bg-slate-100/80 rounded-md w-1/3" />
          <div className="h-2.5 bg-slate-100/50 rounded-md w-2/3" />
        </div>
      </div>
    </div>
  );
}
