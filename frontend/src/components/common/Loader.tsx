interface LoaderProps {
  text?: string;
}

export function Loader({ text = 'Загрузка...' }: LoaderProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 select-none">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-100 dark:border-slate-800" />
        <div className="absolute w-12 h-12 rounded-full border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
        <div className="absolute text-sm">✨</div>
      </div>
      {text && (
        <p className="mt-4 text-xs font-black text-slate-400 dark:text-slate-500 font-mono tracking-widest uppercase animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
