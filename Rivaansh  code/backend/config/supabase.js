const { createClient } = require('@supabase/supabase-js');

// Initialize from Environment Variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log('✅ Supabase Client Initialized');
        
        // Quick verification check (async - don't block)
        supabase.from('products').select('id', { count: 'exact', head: true })
            .then(({ error }) => {
                if (error) {
                    console.warn('⚠️ Supabase Connectivity Issue:', error.message);
                } else {
                    console.log('📡 Supabase Connected & Authorized');
                }
            })
            .catch(err => console.warn('⚠️ Supabase Probe Failed:', err.message));
            
    } catch (err) {
        console.error('❌ Supabase Init Error:', err.message);
    }
} else {
    console.warn('⚠️ Supabase credentials missing. Supabase Client not initialized.');
}

module.exports = supabase;
