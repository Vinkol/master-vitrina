import { useState } from 'react';

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Кому подходит это решение?',
      a: 'Любому специалисту с почасовой записью: бьюти-мастерам, репетиторам, психологам,фотографам и тд. Система полностью адаптируется под ваш прайс и расписание.',
    },
    {
      q: 'Нужно ли клиентам регистрироваться?',
      a: 'Нет. Клиент просто кликает по вашей ссылке прямо внутри Telegram. У него мгновенно открывается витрина, где он выбирает время и записывается за 3 клика без лишних СМС и паролей.',
    },
    {
      q: 'Как я узнаю о новых записях?',
      a: 'Наш Telegram-бот мгновенно пришлет вам push-уведомление с деталями записи (имя, телефон, услуга, время) и автоматически занесет сеанс в ваш внутренний календарь.',
    },
    {
      q: 'Можно ли бороться со спамом и отменами?',
      a: 'Да. Встроенная CRM позволяет отслеживать историю клиентов и блокировать проблемных пользователей в один клик. В будущем также появится функция обязательной предоплаты.',
    },
  ];

  return (
    <section  id="faq" className="bg-white dark:bg-[#020617] py-12 px-4 select-none transition-colors duration-500">
      <div className="max-w-4xl mx-auto grid md:grid-cols-12 gap-12">
        
        {/* ЛЕВАЯ ЧАСТЬ: Фиксированный оффер секции */}
        <div className="md:col-span-4 text-left space-y-4">
          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/30">
            FAQ
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Остались вопросы? <br />Мы ответили на главные.
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Если вашего вопроса нет в списке, наша служба поддержки в Telegram работает круглосуточно.
          </p>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: Адаптивный аккордеон */}
        <div className="md:col-span-8 space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                  isOpen 
                    ? 'border-indigo-500/40 bg-slate-50/50 dark:bg-slate-900/20 shadow-lg shadow-indigo-500/2' 
                    : 'border-slate-200/60 dark:border-slate-800/60 bg-transparent'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-5 font-black text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex justify-between items-center cursor-pointer group"
                >
                  <span className="group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{faq.q}</span>
                  <div className={`w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs transition-transform duration-300 ${
                    isOpen ? 'rotate-45 bg-indigo-600 text-white dark:bg-indigo-500' : 'text-slate-400'
                  }`}>
                    ＋
                  </div>
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-40 border-t border-slate-100 dark:border-slate-800/60' : 'max-h-0'
                  }`}
                >
                  <p className="p-5 text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed bg-white dark:bg-slate-900/40">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

