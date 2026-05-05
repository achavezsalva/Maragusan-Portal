import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Settings > Environment Variables.');
}

export const supabase = createClient(
  supabaseUrl || 'https://ukmaftgnructgcdaruby.supabase.co',
  supabaseAnonKey || 'sb_publishable_L2IqdBPzPdY51y-SQJbq_g_gcctooEJ'
);

// export const supabase = createClient(
//  supabaseUrl || 'https://placeholder.supabase.co',
//  supabaseAnonKey || 'placeholder'
//);
