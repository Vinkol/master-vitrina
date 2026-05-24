import WebApp from '@twa-dev/sdk';

interface WebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

// Инициализируем данные ОДИН раз сразу при старте файла, а не внутри компонента
if (typeof window !== 'undefined' && WebApp) {
  WebApp.ready();
  WebApp.expand();
}

function App() {
  // Достаем юзера напрямую в дефолтное состояние стейта. 
  // Никаких лишних рендеров и эффектов!
  const tgUser = WebApp.initDataUnsafe?.user as WebAppUser | undefined;

  const showAlert = () => {
    if (typeof window !== 'undefined' && WebApp) {
      WebApp.showAlert(`Привет, ${tgUser?.first_name || 'Незнакомец'}! Это твой первый TWA.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-800">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-sm text-center border border-slate-100">
        <h1 className="text-2xl font-bold mb-2 text-indigo-600">МастерВитрина 💅</h1>
        <p className="text-sm text-slate-500 mb-6">Тестовый запуск Web App</p>

        {tgUser ? (
          <div className="bg-indigo-50 p-4 rounded-xl mb-6 text-left">
            <p className="text-xs text-indigo-400 font-semibold uppercase">Данные из TG:</p>
            <p className="font-medium text-slate-700">Имя: {tgUser.first_name} {tgUser.last_name || ''}</p>
            <p className="text-sm text-slate-500">ID: {tgUser.id}</p>
            {tgUser.username && <p className="text-sm text-indigo-600">@{tgUser.username}</p>}
          </div>
        ) : (
          <div className="bg-amber-50 p-3 rounded-xl mb-6 text-sm text-amber-700">
            Приложение запущено в обычном браузере. Открой его в Telegram!
          </div>
        )}

        <button 
          onClick={showAlert}
          className="w-full bg-indigo-600 active:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition duration-150 shadow-sm"
        >
          Проверить Native Alert
        </button>
      </div>
    </div>
  );
}

export default App;
