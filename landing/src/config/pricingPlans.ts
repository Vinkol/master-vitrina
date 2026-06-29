export type CurrencyCode = 'RUB' | 'BYN' | 'USD';

export interface PricingPlan {
  id: 'base' | 'pro' | 'pro_plus';
  name: string;
  price: string;
  currencySymbol: string;
  description: string;
  features: string[];
  buttonText: string;
  isPopular: boolean;
  tag: string;
}

const PRICE_MAP = {
  base: {
    monthly: { RUB: '0', BYN: '0', USD: '0' },
    annual: { RUB: '0', BYN: '0', USD: '0' }
  },
  pro: {
    monthly: { RUB: '490', BYN: '18', USD: '6' },
    annual: { RUB: '390', BYN: '15', USD: '5' }
  },
  pro_plus: {
    monthly: { RUB: '990', BYN: '35', USD: '12' },
    annual: { RUB: '790', BYN: '30', USD: '10' }
  }
};

const SYMBOL_MAP: Record<CurrencyCode, string> = {
  RUB: '₽',
  BYN: 'Br',
  USD: '$'
};

export const getPricingPlans = (isAnnual: boolean, currency: CurrencyCode = 'BYN'): PricingPlan[] => {
  const period = isAnnual ? 'annual' : 'monthly';

  return [
    {
      id: 'base',
      name: 'Базовый',
      price: PRICE_MAP.base[period][currency],
      currencySymbol: SYMBOL_MAP[currency],
      description: 'Идеальный старт для новичков и тестирования формата',
      features: [
        'Безлимитные записи клиентов',
        'До 3-х услуг в прайс-листе',
        'Онлайн-запись по ссылке',
        'Гибкое расписание и перерывы',
        'Клиентская база',
        'Уведомления мастеру в бот',
      ],
      buttonText: 'Начать бесплатно',
      isPopular: false,
      tag: 'Для старта',
    },
    {
      id: 'pro',
      name: 'PRO (Мастер)',
      price: PRICE_MAP.pro[period][currency],
      currencySymbol: SYMBOL_MAP[currency],
      description: 'Рабочая лошадка для мастеров с постоянным потоком клиентов',
      features: [
        'Все функции тарифа Базовый',
        'Безлимитное количество услуг',
        'Настраиваемые перерывы между клиентами',
        'Бесплатные напоминания клиентам в TG',
        'Электронная карта каждого клиента',
        'Черный список',
        'Базовая статистика дохода',
      ],
      buttonText: 'Активировать PRO',
      isPopular: true,
      tag: 'Рекомендуем',
    },
    {
      id: 'pro_plus',
      name: 'PRO+ (Автопилот)',
      price: PRICE_MAP.pro_plus[period][currency],
      currencySymbol: SYMBOL_MAP[currency],
      description: 'Максимальная автоматизация рутины и защита',
      features: [
        'Все функции тарифа PRO',
        'Умный лист ожидания для клиентов',
        'Онлайн-предоплата',
        'Каскадные напоминания (TG + SMS)',
        'Расчет чистой прибыли и материалов',
        'Аналитика возвращаемости',
      ],
      buttonText: 'Включить Автопилот',
      isPopular: false,
      tag: 'Для профи',
    },
  ];
};
