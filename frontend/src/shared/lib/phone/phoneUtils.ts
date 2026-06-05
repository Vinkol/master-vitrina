/* Функция маскирования номера телефона для СНГ (RU, BY, UA) */
export type CountryCode = 'RU' | 'BY' | 'UA';

export interface CountryConfig {
  code: CountryCode;
  prefix: string;
  flag: string;
  placeholder: string;
  digitsCount: number;
}

export const COUNTRY_CONFIGS: Record<CountryCode, CountryConfig> = {
  RU: { code: 'RU', prefix: '+7', flag: '🇷🇺', placeholder: '(999) 000-00-00', digitsCount: 11 },
  BY: { code: 'BY', prefix: '+375', flag: '🇧🇾', placeholder: '(29) 000-00-00', digitsCount: 12 },
  UA: { code: 'UA', prefix: '+380', flag: '🇺🇦', placeholder: '(67) 000-00-00', digitsCount: 12 },
};

/**
 * Чистая маска, которая форматирует только хвост номера (без кода страны)
 */
export function formatPhoneBody(value: string, country: CountryCode): string {
  const digits = value.replace(/\D/g, '');

  if (country === 'RU') {
    let res = '';
    if (digits.length > 0) res += '(' + digits.substring(0, 3);
    if (digits.length > 3) res += ') ' + digits.substring(3, 6);
    if (digits.length > 6) res += '-' + digits.substring(6, 8);
    if (digits.length > 8) res += '-' + digits.substring(8, 10);
    return res;
  } else {
    // Для Беларуси и Украины маска одинаковая: (XX) XXX-XX-XX
    let res = '';
    if (digits.length > 0) res += '(' + digits.substring(0, 2);
    if (digits.length > 2) res += ') ' + digits.substring(2, 5);
    if (digits.length > 5) res += '-' + digits.substring(5, 7);
    if (digits.length > 7) res += '-' + digits.substring(7, 9);
    return res;
  }
}

/* Валидация имени: только буквы, дефисы и пробелы, длина от 3 символов */
export function validateCngName(name: string): boolean {
  const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;
  return nameRegex.test(name.trim()) && name.trim().length >= 3;
}

/* Строгая проверка финальной длины номера телефона перед отправкой в базу */
export function validateCngPhoneLength(phone: string): boolean {
  const digitsCount = phone.replace(/\D/g, '').length;
  // Для РФ/UA/BY в полной международной записи должно быть строго 11 или 12 цифр
  return digitsCount === 11 || digitsCount === 12;
}
