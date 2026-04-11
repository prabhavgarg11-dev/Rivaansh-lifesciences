const { createClient } = require('@supabase/supabase-js');

// Initialize from Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase Client Initialized via Express');
} else {
    console.warn('⚠️ Supabase credentials missing. Supabase Client not initialized.');
}

module.exports = supabase;
