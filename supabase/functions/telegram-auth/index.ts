/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { createClient } from "npm:@supabase/supabase-js@2.43.1"

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Настройка CORS-заголовков для работы с фронтендом
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Функция валидации данных от Telegram
async function validateTelegramData(initData: string): Promise<{ isValid: boolean; user?: any }> {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');

  if (!hash) return { isValid: false };

  const keys = Array.from(urlParams.keys())
    .filter((key) => key !== 'hash')
    .sort();
  const dataCheckString = keys.map((key) => `${key}=${urlParams.get(key)}`).join('\n');

  // Хэшируем BOT_TOKEN с помощью строки WebAppData
  const encoder = new TextEncoder();
  const webAppDataKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode('WebAppData'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const secretKeyBuffer = await crypto.subtle.sign(
    'HMAC',
    webAppDataKey,
    encoder.encode(BOT_TOKEN),
  );

  // Хэшируем dataCheckString с помощью полученного ключа
  const secretKey = await crypto.subtle.importKey(
    'raw',
    secretKeyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    secretKey,
    encoder.encode(dataCheckString),
  );

  // Переводим в hex-строку
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Сравниваем полученный хэш с хэшем от Telegram
  if (signature === hash) {
    const userString = urlParams.get('user');
    return {
      isValid: true,
      user: userString ? JSON.parse(userString) : undefined,
    };
  }

  return { isValid: false };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { initData } = await req.json();

    if (!initData) {
      return new Response(JSON.stringify({ error: 'Missing initData' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Валидация
    const { isValid, user } = await validateTelegramData(initData);

    if (!isValid || !user) {
      return new Response(JSON.stringify({ error: 'Invalid Telegram data' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Инициализируем Supabase клиент с правами admin (service_role)
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const tgId = user.id;

    // 2. Ищем существующий профиль по telegram_id
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('telegram_id', tgId)
      .maybeSingle();

    let userId = existingProfile?.id;

    // 3. Если пользователя нет, регистрируем его
    if (!userId) {
      // Создаем пользователя во внутренней системе auth.users
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: `tg_${tgId}@twa.local`, // Фейковый email для уникальности в системе Supabase
        password: crypto.randomUUID(), // Случайный надежный пароль
        email_confirm: true,
        user_metadata: { telegram_id: tgId },
      });

      if (authError || !authUser.user) throw authError || new Error('Failed to create auth user');
      userId = authUser.user.id;

      // Создаем запись в вашей таблице profiles
      const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: userId,
        telegram_id: tgId,
        username: user.username || null,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
        avatar: user.photo_url || null,
        bio: '',
      });

      if (profileError) throw profileError;
    }

    // 4. Генерируем ссылку/токен авторизации для пользователя
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: `tg_${tgId}@twa.local`,
    });

    if (sessionError) throw sessionError;

    // Возвращаем параметры сессии обратно на фронтенд
    return new Response(
      JSON.stringify({
        access_token:
          sessionData.properties?.action_link?.split('token=')[1]?.split('&')[0] || null,
        refresh_token: sessionData.properties?.refresh_token || null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
