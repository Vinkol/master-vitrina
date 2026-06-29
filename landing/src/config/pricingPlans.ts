export interface PricingPlan {
  id: 'base' | 'pro' | 'pro_plus';
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  isPopular: boolean;
  tag: string;
}

export const getPricingPlans = (isAnnual: boolean): PricingPlan[] => [
  {
    id: 'base',
    name: 'Базовый',
    price: '0',
    description: 'Идеальный старт для новичков и тестирования формата',
    features: [
      'Безлимитные записи клиентов',
      'До 3-х услуг в прайс-листе',
      'Онлайн-запись по ссылке в TG',
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
    price: isAnnual ? '390' : '490',
    description: 'Рабочая лошадка для мастеров с постоянным потоком клиентов',
    features: [
      'Все функции тарифа Базовый',
      'Безлимитное количество услуг',
      'Настраиваемые перерывы между клиентами',
      'Бесплатные авто-напоминания клиентам в TG',
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
    price: isAnnual ? '790' : '990',
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
