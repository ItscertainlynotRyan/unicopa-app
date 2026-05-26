import { createClient } from '@supabase/supabase-js';

// A URL do seu projeto (pode manter exatamente essa)
const supabaseUrl = 'https://jtsbgymnemdokupqglyx.supabase.co'; 

// Cole aqui a chave que você acabou de copiar (tire o 'SUA_CHAVE...' e cole o texto todo)
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0c2JneW1uZW1kb2t1cHFnbHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTI3NDAsImV4cCI6MjA5NDE4ODc0MH0.wsmzxBXiKHbl3oQzX_KchOnfSnTQEPtQv9spLqAcUqw'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);