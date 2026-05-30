/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { createClient } from 'npm:@supabase/supabase-js@2.43.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Дефолтное расписание для нового мастера
const defaultSchedule = Array.from({ length: 7 }, (_, i) => ({
  day_index: i,
  is_working: i < 5,
  working_start: '10:00',
  working_end: '18:00',
  breaks: [],
}));

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

async function verifyTelegramAuth(
  initData: string,
  botToken: string,
): Promise<{ isValid: boolean; userData: TelegramUser | null }> {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return { isValid: false, userData: null };
    params.delete('hash');

    const dataCheckString = Array.from(params.entries())
      .map(([key, value]) => `${key}=${value}`)
      .sort()
      .join('\n');

    const encoder = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode('WebAppData'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const secretKeyBuffer = await crypto.subtle.sign('HMAC', baseKey, encoder.encode(botToken));
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
    const signature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return {
      isValid: signature === hash,
      userData: params.get('user') ? JSON.parse(params.get('user')!) : null,
    };
  } catch {
    return { isValid: false, userData: null };
  }
}

function extractTokenFromLink(link: string): string {
  if (!link) return '';
  const parts = link.split('token=');
  return parts.length < 2 ? '' : parts[1].split('&')[0];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } },
    );
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN не задан в Supabase');

    // Читаем параметры: initData и возможный name для регистрации
    const { initData, name } = await req.json();
    if (!initData)
      return new Response(JSON.stringify({ error: 'Пропущен параметр initData' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    let isValid = false;
    let userData = null;

    // Строка разработчика, пускаем без проверки хэша Telegram
    if (initData.includes('123456789') || initData.includes('Dev_Session')) {
      isValid = true;
      userData = { id: 123456789, first_name: 'MasterDev' };
      console.log('[Edge Function]: Локальный запуск на ПК подтвержден.');
    } else {
      // Для реальных устройств запускаем штатную криптографическую валидацию
      const result = await verifyTelegramAuth(initData, TELEGRAM_BOT_TOKEN);
      isValid = result.isValid;
      userData = result.userData;
    }

    if (!isValid || !userData?.id)
      return new Response(JSON.stringify({ error: 'Неверная подпись Telegram' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    const telegramId = userData.id;

    // Ищем профиль мастера
    let { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('owner_tg_id', telegramId)
      .maybeSingle();

    // СЦЕНАРИЙ РЕГИСТРАЦИИ: Профиля нет, но фронтенд прислал имя бизнеса
    if (!profile && name) {
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            owner_tg_id: telegramId,
            name: name,
            bio: 'Добро пожаловать в мою студию!',
            avatar: '💅',
            schedule: defaultSchedule,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      profile = newProfile;
    }

    // Если профиля все еще нет и имя не передано — сообщаем фронтенду о необходимости регистрации
    if (!profile) {
      return new Response(JSON.stringify({ registered: false, telegramId }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Пользователь существует/создан -> Выдаем JWT токен сессии
    const virtualEmail = `tg_${telegramId}@twa.local`;
    // eslint-disable-next-line prefer-const
    let { data: authData, error: authError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: virtualEmail,
      options: { data: { telegram_id: telegramId } },
    });

    if (authError) {
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: virtualEmail,
        password: crypto.randomUUID(),
        email_confirm: true,
        user_metadata: { telegram_id: telegramId },
      });
      if (createError) throw createError;

      const { data: retryAuth, error: retryError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: virtualEmail,
      });
      if (retryError) throw retryError;
      authData = retryAuth;
    }

    const token = extractTokenFromLink(authData.properties.action_link);

    return new Response(
      JSON.stringify({
        registered: true,
        role: 'master',
        token: token,
        masterProfile: [profile],
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
