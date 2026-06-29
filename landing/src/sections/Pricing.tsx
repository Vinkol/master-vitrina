import { useState } from 'react';
import { Button } from '../components/Button';
import { PricingModal } from '../components/PricingModal';
import { getPricingPlans, type PricingPlan, type CurrencyCode } from '../config/pricingPlans';

interface ModalState {
  isOpen: boolean;
  planName: string;
}

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState<boolean>(false);
  const [currency, setCurrency] = useState<CurrencyCode>('BYN');
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, planName: '' });
  const plans: PricingPlan[] = getPricingPlans(isAnnual, currency);

  const openModal = (planName: string): void => {
    setModalState({ isOpen: true, planName });
  };

  const closeModal = (): void => {
    setModalState({ isOpen: false, planName: '' });
  };

  return (
    <section
      id="pricing"
      className="relative bg-transparent px-4 py-24 transition-colors duration-500 select-none"
    >
      <div className="mx-auto max-w-6xl text-center">
        <div className="mb-4">
          <span className="rounded-md border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-black tracking-widest text-indigo-600 uppercase dark:border-indigo-900/30 dark:bg-indigo-950/40 dark:text-indigo-400">
            Тарифы
          </span>
        </div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Инвестируйте в свой комфорт
        </h2>

        <div className="mt-8 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
          
          {/* Переключатель ВАЛЮТЫ */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200/40 dark:border-slate-700/30">
            {(['RUB', 'BYN', 'USD'] as CurrencyCode[]).map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`text-[10px] font-black tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currency === cur
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {cur}
              </button>
            ))}
          </div>

          {/* Переключатель периода */}
          <div className="flex items-center justify-center gap-3">
            <span
              className={`text-xs font-bold transition-colors ${!isAnnual ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
            >
              Ежемесячно
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative flex h-6 w-12 cursor-pointer items-center rounded-full bg-slate-200 p-1 transition-colors dark:bg-slate-800"
            >
              <div
                className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
            <span
              className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isAnnual ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
            >
              Ежегодно{' '}
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                Скидка 20%
              </span>
            </span>
          </div>
        </div>

        {/* Сетка тарифов */}
        <div className="mt-16 grid items-stretch gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl border bg-white p-6 text-left transition-all duration-300 lg:p-8 dark:bg-slate-900/40 ${
                plan.isPopular
                  ? 'neon-glow z-10 border-indigo-500 md:scale-105 dark:border-indigo-500/80'
                  : 'border-slate-200/60 dark:border-slate-800/60'
              }`}
            >
              <span
                className={`absolute -top-3 left-6 rounded-md px-3 py-1 text-[9px] font-black tracking-widest uppercase shadow-sm ${
                  plan.isPopular
                    ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white'
                    : 'border border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700/50 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {plan.tag}
              </span>

              <div>
                <h3 className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="mt-1.5 min-h-8 text-[11px] leading-relaxed font-medium text-slate-400 dark:text-slate-500">
                  {plan.description}
                </p>

                <div className="my-6 flex items-baseline gap-1.5">
                  <span className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">
                    {plan.price} {plan.currencySymbol}
                  </span>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                    / мес
                  </span>
                </div>

                <div className="my-5 h-px bg-slate-100 dark:bg-slate-800/60" />

                <ul className="space-y-3.5">
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-2.5 text-xs leading-tight font-semibold text-slate-600 dark:text-slate-300"
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-[9px] font-black text-indigo-600 dark:text-indigo-400">
                        ✓
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                {plan.price === '0' ? (
                  <a
                    href="https://t.me/mastervitrinabot"
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full"
                  >
                    <Button variant="secondary">{plan.buttonText}</Button>
                  </a>
                ) : (
                  <Button
                    variant={plan.isPopular ? 'popular' : 'secondary'}
                    onClick={() => openModal(plan.name)}
                    className="w-full cursor-pointer"
                  >
                    {plan.buttonText}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <PricingModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        selectedPlan={modalState.planName}
      />
    </section>
  );
}

