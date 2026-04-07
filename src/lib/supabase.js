import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase keys are missing! Create a .env.local file in your project root with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

// Fallback to placeholders just so the app doesn't fatally crash on boot if environment variables are missing
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
);
