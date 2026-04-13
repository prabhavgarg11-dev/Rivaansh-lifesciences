
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedSupabase() {
  console.log('🚀 Starting Supabase Seeding...');

  try {
    // 1. Read products from JSON
    const productsPath = path.join(__dirname, 'data', 'products.json');
    if (!fs.existsSync(productsPath)) {
      console.error('❌ products.json not found in backend/data/');
      return;
    }

    const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    console.log(`📦 Found ${products.length} products to seed.`);

    // 2. Insert into Supabase 'products' table
    // Note: This assumes the table exists and has compatible columns
    const { data, error } = await supabase.from('products').upsert(products, { onConflict: 'id' });

    if (error) {
      console.error('❌ Error seeding Supabase:', error.message);
      if (error.code === '42P01') {
        console.log('💡 Tip: You need to create the "products" table in your Supabase SQL editor first.');
        console.log(`
CREATE TABLE products (
  id BIGINT PRIMARY KEY,
  name TEXT,
  price NUMERIC,
  original_price NUMERIC,
  description TEXT,
  category TEXT,
  brand TEXT,
  composition TEXT,
  image TEXT,
  prescription_required BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
        `);
      }
    } else {
      console.log('✅ Successfully seeded products to Supabase!');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

seedSupabase();
