interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
}

export function Header({ theme, toggleTheme }: HeaderProps) {
  const menuItems = [
    { label: 'Процесс', id: 'steps' },
    { label: 'Функционал', id: 'demo' },
    { label: 'Вопросы', id: 'faq' },
    { label: 'Тарифы', id: 'pricing' },
  ];

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass-widget backdrop-blur-xl border-b border-white/20 dark:border-white/3 transition-colors duration-500 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        
        <button 
          onClick={() => handleScroll('hero')}
          className="text-xs font-black text-slate-900 dark:text-white tracking-widest uppercase flex items-center gap-1.5 cursor-pointer"
        >
          <span className="text-indigo-500">⚡</span> booking.twa
        </button>

        <div className="flex items-center gap-6">
          <nav className="hidden sm:flex items-center gap-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleScroll(item.id)}
                className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={toggleTheme}
            className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer bg-slate-100/50 dark:bg-white/4 border border-slate-200/50 dark:border-white/5 px-3 py-1.5 rounded-full select-none active:scale-95"
          >
            {theme === 'dark' ? '☀️ Светлая' : '🌙 Темная'}
          </button>
        </div>

      </div>
    </header>
  );
}
