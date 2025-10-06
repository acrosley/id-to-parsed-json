#!/usr/bin/env tsx
/**
 * Simple database setup script for id-to-parsed-json project
 */

import { sql } from '@vercel/postgres';

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database schema...');
    
    // Create licenses table
    await sql`
      CREATE TABLE IF NOT EXISTS licenses (
        id BIGSERIAL PRIMARY KEY,
        file_key TEXT,
        mime_type TEXT NOT NULL,
        source TEXT NOT NULL,
        payload_raw TEXT,
        parsed_json JSONB NOT NULL,
        confidence NUMERIC(3,2) DEFAULT 0.98 CHECK (confidence >= 0 AND confidence <= 1),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    console.log('✅ Created licenses table');
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_licenses_created_at ON licenses(created_at);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_licenses_source ON licenses(source);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_licenses_confidence ON licenses(confidence);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_licenses_parsed_json ON licenses USING GIN(parsed_json);`;
    
    console.log('✅ Created indexes');
    
    // Test the connection
    const result = await sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'licenses' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Table structure:');
    console.table(result.rows);
    
    // Test insert/delete
    console.log('\n🧪 Testing database operations...');
    const testRecord = {
      jurisdiction: 'TEST',
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

setupDatabase();
