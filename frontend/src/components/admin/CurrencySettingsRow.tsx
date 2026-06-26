import { useState } from 'react';
import { haptic } from '../../shared/lib/haptic/haptic';
import { Coins, ChevronRight, Check } from 'lucide-react';
import { CURRENCY_SYMBOLS } from '../../shared/lib/formatPrice/priceFormatter';

const CURRENCY_NAMES: Record<string, string> = {
  RUB: 'Российский рубль',
  BYN: 'Белорусский рубль',
  UAH: 'Украинская гривна',
  USD: 'Доллар США',
};

interface CurrencySettingsRowProps {
  currentCurrency: string;
  onSelectCurrency: (code: string) => void;
  disabled?: boolean;
}

export function CurrencySettingsRow({
  currentCurrency,
  onSelectCurrency,
  disabled = false,
}: CurrencySettingsRowProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const currencyCodes = Object.keys(CURRENCY_SYMBOLS);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          haptic.impact('light');
          setIsOpen(!isOpen);
        }}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 active:bg-slate-50/80 transition-colors group text-left disabled:opacity-50 rounded-t-2xl"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-100/70 transition-colors">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-800 leading-none">Валюта</p>
            <p className="text-[10px] font-medium text-slate-400 mt-1">Для цен на витрине</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 min-w-0">
          <span className="text-xs font-black text-indigo-600 bg-indigo-50/60 px-2.5 py-1 rounded-lg border border-indigo-100/40 text-center uppercase tracking-wider">
            {currentCurrency}
          </span>
          <ChevronRight
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-90 text-indigo-500' : ''
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />

          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200/80 rounded-2xl shadow-2xl z-50 divide-y divide-slate-50 max-h-56 overflow-y-auto animate-fadeIn scrollbar-none">
            {currencyCodes.map((code, index) => {
              const isSelected = currentCurrency === code;
              const symbol = CURRENCY_SYMBOLS[code];
              const name = CURRENCY_NAMES[code] || code;

              const isFirst = index === 0;
              const isLast = index === currencyCodes.length - 1;

              return (
                <button
                  type="button"
                  key={code}
                  onClick={() => {
                    haptic.impact('medium');
                    onSelectCurrency(code);
                    setIsOpen(false);
                  }}
                  className={`w-full p-3.5 text-left flex justify-between items-center transition-colors text-xs font-bold ${
                    isSelected
                      ? 'bg-indigo-50/60 text-indigo-600'
                      : 'text-slate-700 hover:bg-slate-50/80 active:bg-slate-50'
                  } ${isFirst ? 'rounded-t-2xl' : ''} ${isLast ? 'rounded-b-2xl' : ''}`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                    <span
                      className={`w-5 h-5 flex items-center justify-center rounded-md text-[10px] font-black shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {symbol}
                    </span>
                    <span className="truncate">{name}</span>
                  </div>

                  <div className="text-right shrink-0 flex items-center space-x-2">
                    <span
                      className={
                        isSelected ? 'text-indigo-600 font-black' : 'text-slate-400 font-medium'
                      }
                    >
                      {code}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" strokeWidth={3} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
