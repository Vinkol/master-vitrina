import { createClient } from 'npm:@supabase/supabase-js@2.43.0';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface VerificationResult {
  isValid: boolean;
  userData: TelegramUser | null;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifyTelegramAuth(initData: string, botToken: string): Promise<VerificationResult> {
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

    if (signature !== hash) {
      return { isValid: false, userData: null };
    }

    const userParam = params.get('user');
    const userData: TelegramUser | null = userParam ? JSON.parse(userParam) : null;

    return { isValid: true, userData };
  } catch (error) {
    console.error('[Telegram Auth Error]:', error);
    return { isValid: false, userData: null };
  }
}

function extractTokenFromLink(link: string): string {
  if (!link) return '';
  const parts = link.split('token=');
  if (parts.length < 2) return '';
  return parts[1].split('&')[0];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } },
    );

    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error(
        'Критическая ошибка конфигурации: TELEGRAM_BOT_TOKEN не задан в Supabase Secrets',
      );
    }

    const { initData } = await req.json();
    if (!initData) {
      return new Response(JSON.stringify({ error: 'Пропущен обязательный параметр initData' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { isValid, userData } = await verifyTelegramAuth(initData, TELEGRAM_BOT_TOKEN);

    if (!isValid || !userData?.id) {
      return new Response(
        JSON.stringify({ error: 'Неверная или просроченная цифровая подпись Telegram' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const telegramId = userData.id;

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('owner_tg_id', telegramId)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!profile) {
      return new Response(
        JSON.stringify({
          registered: false,
          telegramId: telegramId,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const virtualEmail = `tg_${telegramId}@twa.local`;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.generateLink({
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

      return new Response(
        JSON.stringify({
          registered: true,
          role: 'master',
          token: extractTokenFromLink(retryAuth.properties.action_link),
          masterProfile: [profile],
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const token = extractTokenFromLink(authData.properties.action_link);

    return new Response(
      JSON.stringify({
        registered: true,
        role: 'master',
        token: token,
        masterProfile: [profile],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка сервера';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
