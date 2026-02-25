import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://namezostcjisfuzxjdaq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbWV6b3N0Y2ppc2Z1enhqZGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MTI0MzYsImV4cCI6MjA4NzQ4ODQzNn0.Axt6BUajOXHv9wisYXLKAShM4SI5J6G67JuEN770egw";

export const supabase = createClient(supabaseUrl, supabaseKey);