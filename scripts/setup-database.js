#!/usr/bin/env node
/**
 * Database setup script for id-to-parsed-json project
 * This script creates the licenses table and sets up the database schema
 */

import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database schema...');
    
    // Read the SQL schema file
    const schemaPath = join(__dirname, '..', 'sql', '001_create_licenses_table.sql');
    const schemaSQL = readFileSync(schemaPath, 'utf8');
    
    // Execute the schema - use template literal for raw SQL
    await sql`${schemaSQL}`;
    
    console.log('✅ Database schema created successfully!');
    console.log('📋 Created table: licenses');
    console.log('📊 Created indexes for performance');
    
    // Test the connection by querying the table
    const result = await sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'licenses' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Table structure:');
    console.table(result.rows);
    
    console.log('\n🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
