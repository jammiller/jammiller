import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://kyfdxpqbiysbtisyqzon.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZmR4cHFiaXlzYnRpc3lxem9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNzc4MTksImV4cCI6MjA5Njg1MzgxOX0.pBX6HSOIs7kfHq7NZwe_--RS-1MEOo2BfM-Turgtl0I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
