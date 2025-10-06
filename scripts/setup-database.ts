#!/usr/bin/env tsx
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
    
    // Test inserting a sample record
    console.log('\n🧪 Testing database operations...');
    const testRecord = {
      jurisdiction: 'CA',
      idNumber: 'TEST123456',
      firstName: 'John',
      lastName: 'Doe',
      rawSource: 'pdf417' as const,
      confidence: 0.98
    };
    
    const insertResult = await sql`
      INSERT INTO licenses (mime_type, source, payload_raw, parsed_json, confidence)
      VALUES ('image/jpeg', 'test', 'test payload', ${JSON.stringify(testRecord)}::jsonb, 0.98)
      RETURNING id;
    `;
    
    console.log(`✅ Test record inserted with ID: ${insertResult.rows[0].id}`);
    
    // Clean up test record
    await sql`DELETE FROM licenses WHERE id = ${insertResult.rows[0].id}`;
    console.log('🧹 Test record cleaned up');
    
    console.log('\n🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', (error as Error).message);
    console.error('💡 Make sure you have:');
    console.error('   - Vercel Postgres database configured');
    console.error('   - POSTGRES_URL environment variable set');
    console.error('   - Database connection permissions');
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
