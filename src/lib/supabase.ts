import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pkeojnwapdwvwjdkqwwz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrZW9qbndhcGR3dndqZGtxd3d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NTMxMjgsImV4cCI6MjEwNTIyOTEyOH0.IRINSfI2CF12PUBnlOc9hlf7owRJRoCWxjhxB-O0RDI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
