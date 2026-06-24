import { useEffect } from 'react';

interface UseTelegramMainButtonProps {
  isFormValid: boolean;
  buttonText: string;
  onClick: () => Promise<void> | void;
}

export function useTelegramMainButton({
  isFormValid,
  buttonText,
  onClick,
}: UseTelegramMainButtonProps) {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    if (isFormValid) {
      tg.MainButton.text = buttonText;
      tg.MainButton.show();

      const handleButtonClick = () => {
        tg.MainButton.showProgress();
        void (async () => {
          await onClick();
          tg.MainButton.hideProgress();
          tg.MainButton.hide();
        })();
      };

      tg.MainButton.onClick(handleButtonClick);

      return () => {
        tg.MainButton.offClick(handleButtonClick);
        tg.MainButton.hide();
      };
    } else {
      tg.MainButton.hide();
    }
  }, [isFormValid, buttonText, onClick]);
}
