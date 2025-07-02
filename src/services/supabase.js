import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://raznqfzqbmlstchmlwcj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhem5xZnpxYm1sc3RjaG1sd2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDQ3NjUsImV4cCI6MjA2MzI4MDc2NX0.CujD9ininfbSRuRTgLCogKHJKc0FvSMlu-1-Kuung_4";

// Creamos el cliente.
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;