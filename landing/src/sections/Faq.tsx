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
    <section
      id="faq"
      className="bg-white px-4 py-12 transition-colors duration-500 select-none dark:bg-[#020617]"
    >
      <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-12">
        {/* ЛЕВАЯ ЧАСТЬ: Фиксированный оффер секции */}
        <div className="space-y-4 text-left md:col-span-4">
          <span className="rounded-md border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-black tracking-widest text-indigo-600 uppercase dark:border-indigo-900/30 dark:bg-indigo-950/40 dark:text-indigo-400">
            FAQ
          </span>
          <h2 className="text-2xl leading-tight font-black tracking-tight text-slate-900 dark:text-white">
            Остались вопросы? <br />
            Мы ответили на главные.
          </h2>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Если вашего вопроса нет в списке, наша служба поддержки в Telegram работает
            круглосуточно.
          </p>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: Адаптивный аккордеон */}
        <div className="space-y-3 md:col-span-8">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? 'border-indigo-500/40 bg-slate-50/50 shadow-lg shadow-indigo-500/2 dark:bg-slate-900/20'
                    : 'border-slate-200/60 bg-transparent dark:border-slate-800/60'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="group flex w-full cursor-pointer items-center justify-between p-5 text-left text-xs font-black text-slate-800 sm:text-sm dark:text-slate-200"
                >
                  <span className="transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
                    {faq.q}
                  </span>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-xs transition-transform duration-300 dark:bg-slate-800 ${
                      isOpen
                        ? 'rotate-45 bg-indigo-600 text-white dark:bg-indigo-500'
                        : 'text-slate-400'
                    }`}
                  >
                    ＋
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen
                      ? 'max-h-40 border-t border-slate-100 dark:border-slate-800/60'
                      : 'max-h-0'
                  }`}
                >
                  <p className="bg-white p-5 text-xs leading-relaxed font-semibold text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
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
