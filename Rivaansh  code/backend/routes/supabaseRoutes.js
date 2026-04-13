const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

/**
 * GET /api/supabase/status
 * Health check for Supabase connection
 */
router.get('/status', async (req, res) => {
    if (!supabase) {
        return res.json({ status: 'OFFLINE', message: 'Credentials missing' });
    }
    
    const { error } = await supabase.from('products').select('id', { count: 'exact', head: true });
    
    if (error) {
        return res.json({ status: 'ERROR', error: error.message });
    }
    
    res.json({ status: 'ONLINE', message: 'Supabase Clinical Hub Ready' });
});

/**
 * GET /api/supabase/products
 * Fetches pharmaceutical catalogue from Supabase
 */
router.get('/products', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase client not initialized' });
    }

    try {
        const { data: products, error } = await supabase.from('products').select('*');

        if (error) {
            console.error('Supabase fetch error:', error);
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (err) {
        console.error('Express endpoint error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * GET /api/supabase/todos (Legacy/Sample)
 */
router.get('/todos', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase client not initialized' });
    }

    try {
        const { data: todos, error } = await supabase.from('todos').select();
        if (error) return res.status(500).json({ error: error.message });

        res.status(200).json({ success: true, todos });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
