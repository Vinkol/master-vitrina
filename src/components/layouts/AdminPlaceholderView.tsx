interface AdminPlaceholderViewProps {
  title: string;
  icon: string;
}

export function AdminPlaceholderView({ title, icon }: AdminPlaceholderViewProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-slate-100 dark:border-slate-700 animate-bounce duration-1000">
        {icon}
      </div>
      <h3 className="text-base font-black text-slate-700 dark:text-slate-300 mt-4">
        Раздел «{title}» в разработке
      </h3>
      <p className="text-xs text-slate-400 max-w-60 mt-1 leading-relaxed">
        Мы уже пишем код для этой фичи. Она появится в ближайшем обновлении вашей витрины!
      </p>
    </div>
  );
}
