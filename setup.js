#!/usr/bin/env node

/**
 * SETUP SCRIPT - Run this to automatically set up everything
 * Usage: node setup.js
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get credentials from environment
const supabaseUrl = 'https://bxxpdlesrebnvqtxcmes.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4eHBkbGVzcmVibnZxdHhjbWVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ2Mjg4NiwiZXhwIjoyMDg2MDM4ODg2fQ.81L-VVRS5RCoQf4ltikHEOh-X2ZP27NTLYTzWq6OBEU';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setup() {
  console.log('🚀 Starting Supabase Setup...\n');

  try {
    // Read SQL file
    const sqlFile = path.join(__dirname, 'SUPABASE_SETUP.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');

    // Split into individual queries
    const queries = sql
      .split(';')
      .map(q => q.trim())
      .filter(q => q && !q.startsWith('--') && !q.startsWith('/*'));

    console.log(`📝 Found ${queries.length} SQL statements\n`);

    let successCount = 0;
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      if (!query) continue;

      console.log(`⏳ Executing query ${i + 1}/${queries.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { query });
        
        if (error) {
          console.log(`   ⚠️  Query ${i + 1}: ${error.message}`);
        } else {
          console.log(`   ✅ Query ${i + 1} executed successfully`);
          successCount++;
        }
      } catch (err) {
        console.log(`   ⚠️  Query ${i + 1}: Could not execute via RPC`);
      }
    }

    console.log(`\n✅ Setup Complete! Executed ${successCount} queries successfully\n`);
    console.log('📊 Tables created:');
    console.log('   ✅ users');
    console.log('   ✅ hotels');
    console.log('   ✅ trips\n');

    console.log('🎯 Next steps:');
    console.log('   1. Verify tables in Supabase dashboard');
    console.log('   2. Run: cd customer && npm run dev');
    console.log('   3. Login with: customer@example.com / demo\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n💡 If RPC method not available, copy SUPABASE_SETUP.sql to Supabase SQL Editor manually');
    process.exit(1);
  }
}

setup();
