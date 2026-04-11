const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

/**
 * Equivalent translation of page.tsx 
 * Fetches todos from Supabase and returns them
 */
router.get('/todos', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase client not initialized' });
    }

    try {
        // Query equivalent to `await supabase.from('todos').select()`
        const { data: todos, error } = await supabase.from('todos').select();

        if (error) {
            console.error('Supabase fetch error:', error);
            return res.status(500).json({ error: error.message });
        }

        // Return JSON instead of Server-Side React Array mapping
        res.status(200).json({
            success: true,
            todos
        });
    } catch (err) {
        console.error('Express endpoint error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
