import { createClient } from '@supabase/supabase-js';

// TODO: substitua essas variáveis pelos valores do seu projeto Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
