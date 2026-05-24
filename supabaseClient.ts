import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://beynlmclrkttmektxzav.supabase.co';
const supabaseAnonKey = 'sb_publishable_a-rUIfN_pM0EQAuKNJLwuQ_xNo3JUpl';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
