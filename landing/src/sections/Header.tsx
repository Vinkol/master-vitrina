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
    <header className="glass-widget fixed top-0 right-0 left-0 z-40 border-b border-white/20 shadow-sm backdrop-blur-xl transition-colors duration-500 dark:border-white/3">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <button
          onClick={() => handleScroll('hero')}
          className="flex cursor-pointer items-center gap-1.5 text-xs font-black tracking-widest text-slate-900 uppercase dark:text-white"
        >
          <span className="text-indigo-500">⚡</span> booking.twa
        </button>

        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-6 sm:flex">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleScroll(item.id)}
                className="cursor-pointer text-[11px] font-black tracking-wider text-slate-500 uppercase transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={toggleTheme}
            className="cursor-pointer rounded-full border border-slate-200/50 bg-slate-100/50 px-3 py-1.5 text-[11px] font-black tracking-wider text-slate-700 uppercase transition-colors select-none hover:text-indigo-600 active:scale-95 dark:border-white/5 dark:bg-white/4 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            {theme === 'dark' ? '☀️ Светлая' : '🌙 Темная'}
          </button>
        </div>
      </div>
    </header>
  );
}
