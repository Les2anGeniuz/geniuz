// app/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sesvblqrcbdmnkfvugtk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlc3ZibHFyY2JkbW5rZnZ1Z3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTM1OTksImV4cCI6MjA3NzQ2OTU5OX0.P0K8eArNI7oSs2NjisRgVAlE2IbXfx0lP6TIGZLR3K0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
