// 1. Описываем строгие типы для Telegram SDK
interface WebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  showAlert: (message: string) => void;
  initDataUnsafe?: {
    user?: WebAppUser;
  };
}

// Расширяем глобальный объект window для TypeScript
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// 2. Инициализируем нативные методы Telegram ОДИН раз при загрузке скрипта
const tgInstance = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;

if (tgInstance) {
  tgInstance.ready();
  tgInstance.expand();
}

function App() {
  // Достаем данные синхронно прямо в константы. Никаких эффектов и лишних рендеров!
  const isTelegram = Boolean(tgInstance);
  const tgUser = tgInstance?.initDataUnsafe?.user;

  const showAlert = () => {
    if (tgInstance) {
      tgInstance.showAlert(`Привет, ${tgUser?.first_name || 'Пользователь'}!`);
    } else {
      alert(`Привет из обычного браузера!`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-800">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-sm text-center border border-slate-100">
        <h1 className="text-2xl font-bold mb-2 text-indigo-600">МастерВитрина 💅</h1>
        <p className="text-sm text-slate-500 mb-6">Тестовый запуск Web App</p>

        {isTelegram && tgUser ? (
          <div className="bg-indigo-50 p-4 rounded-xl mb-6 text-left">
            <p className="text-xs text-indigo-400 font-semibold uppercase">Данные из TG:</p>
            <p className="font-medium text-slate-700">Имя: {tgUser.first_name} {tgUser.last_name || ''}</p>
            <p className="text-sm text-slate-500">ID: {tgUser.id}</p>
            {tgUser.username && <p className="text-sm text-indigo-600">@{tgUser.username}</p>}
          </div>
        ) : (
          <div className="bg-amber-50 p-3 rounded-xl mb-6 text-sm text-amber-700">
            {isTelegram 
              ? "Загрузка данных Telegram..." 
              : "Приложение запущено в обычных браузерах. Открой его в Telegram!"}
          </div>
        )}

        <button 
          onClick={showAlert}
          className="w-full bg-indigo-600 active:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition duration-150 shadow-sm"
        >
          Проверить Alert
        </button>
      </div>
    </div>
  );
}

export default App;
