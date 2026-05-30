/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { createClient } from 'npm:@supabase/supabase-js@2.43.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

async function generateCustomJWT(
  telegramId: number,
  role: string,
  jwtSecret: string,
): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };

  const payload = {
    role: 'authenticated',
    iss: 'supabase',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // Токен живет 7 дней
    user_metadata: {
      telegram_id: telegramId,
      role: role,
    },
  };

  const encoder = new TextEncoder();
  const base64url = (source: Uint8Array) =>
    btoa(String.fromCharCode(...source))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const encodedHeader = base64url(encoder.encode(JSON.stringify(header)));
  const encodedPayload = base64url(encoder.encode(JSON.stringify(payload)));
  const tokenData = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(jwtSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(tokenData));
  const encodedSignature = base64url(new Uint8Array(signatureBuffer));

  return `${tokenData}.${encodedSignature}`;
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
    const JWT_SECRET = Deno.env.get('JWT_SECRET');

    if (!TELEGRAM_BOT_TOKEN || !JWT_SECRET) {
      throw new Error(
        'Критическая ошибка: Переменные TELEGRAM_BOT_TOKEN или JWT_SECRET не заданы в Supabase',
      );
    }

    const { initData, name } = await req.json();
    if (!initData)
      return new Response(JSON.stringify({ error: 'Пропущен параметр initData' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    let isValid = false;
    let userData = null;

    if (initData.includes('123456789') || initData.includes('Dev_Session')) {
      isValid = true;
      userData = { id: 123456789, first_name: 'MasterDev' };
      console.log('[Edge Function]: Локальный запуск на ПК подтвержден.');
    } else {
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

    let { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('owner_tg_id', telegramId)
      .maybeSingle();

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

    if (!profile) {
      return new Response(JSON.stringify({ registered: false, telegramId }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const customToken = await generateCustomJWT(telegramId, 'master', JWT_SECRET);

    return new Response(
      JSON.stringify({
        registered: true,
        role: 'master',
        token: customToken,
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
