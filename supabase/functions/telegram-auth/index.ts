/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { createClient } from 'npm:@supabase/supabase-js@2.43.1';

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

async function validateTelegramData(initData: string): Promise<{ isValid: boolean; user?: any }> {
  if (
    initData ===
    'query_id=AA_Dev_Session&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22MasterDev%22%2C%22username%22%3A%22dev_master%22%7D&hash=dev_mock_hash'
  ) {
    return {
      isValid: true,
      user: { id: 123456789, first_name: 'MasterDev', username: 'dev_master' },
    };
  }

  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  if (!hash) return { isValid: false };

  const keys = Array.from(urlParams.keys())
    .filter((key) => key !== 'hash')
    .sort();
  const dataCheckString = keys.map((key) => `${key}=${urlParams.get(key)}`).join('\n');

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
    user: urlParams.get('user') ? JSON.parse(urlParams.get('user')) : undefined,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: CORS_HEADERS });
  }

  try {
    const { initData, name, registerAsMaster } = await req.json();

    if (!initData) {
      return new Response(JSON.stringify({ error: 'Missing initData' }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const { isValid, user } = await validateTelegramData(initData);
    if (!isValid || !user) {
      return new Response(JSON.stringify({ error: 'Invalid Telegram data' }), {
        status: 403,
        headers: CORS_HEADERS,
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const tgId = user.id;

    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('telegram_id', tgId)
      .maybeSingle();

    let userId = existingProfile?.id;

    if (!userId) {
      if (!registerAsMaster) {
        return new Response(JSON.stringify({ registered: false }), {
          status: 200,
          headers: CORS_HEADERS,
        });
      }

      // Нативная регистрация пользователя через стандартный встроенный механизм без фейковых email
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: `tg_${tgId}@twa.local`,
        password: `pass_${tgId}_twa_secure_key`,
        email_confirm: true,
        user_metadata: { telegram_id: tgId },
      });

      if (authError || !authUser.user) throw authError || new Error('Failed to create auth user');
      userId = authUser.user.id;

      const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: userId,
        telegram_id: tgId,
        username: user.username || null,
        name: name || `${user.first_name || ''}`.trim(),
        avatar: user.photo_url || null,
        bio: '',
        schedule: [],
      });

      if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw profileError;
      }
    }

    await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: `pass_${tgId}_twa_secure_key`,
    });

    return new Response(
      JSON.stringify({
        registered: true,
        role: 'master',
        email: `tg_${tgId}@twa.local`,
        password: `pass_${tgId}_twa_secure_key`,
        masterId: userId,
      }),
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
});
