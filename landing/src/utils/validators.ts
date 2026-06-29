export interface ValidationResult {
  isValid: boolean;
  error: string;
}

export const validateTelegramUsername = (username: string): ValidationResult => {
  if (!username) {
    return { isValid: false, error: 'Поле обязательно для заполнения' };
  }

  if (username.length < 5) {
    return { isValid: false, error: 'Никнейм должен быть не короче 5 символов' };
  }

  if (username.length > 32) {
    return { isValid: false, error: 'Никнейм не должен превышать 32 символа' };
  }

  const tgRegex = /^[a-zA-Z0-9_]+$/;
  if (!tgRegex.test(username)) {
    return { isValid: false, error: 'Допустимы только латинские буквы, цифры и "_"' };
  }

  return { isValid: true, error: '' };
};
