import { useEffect } from 'react';
import { AuthGuard } from './navigation/AuthGuard';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.expand();
    }
  }, []);

  return (
    <>
      <AuthGuard />
      <SpeedInsights />
    </>
  );
}
