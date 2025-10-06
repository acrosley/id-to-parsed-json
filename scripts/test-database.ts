#!/usr/bin/env tsx
/**
 * Test database connection and basic operations
 */

import { sql } from '@vercel/postgres';

async function testDatabase() {
  try {
    console.log('🧪 Testing database connection...');
    
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful');
    console.log(`🕐 Current time: ${result.rows[0].current_time}`);
    
    // Check if licenses table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'licenses'
      ) as table_exists;
    `;
    
    if (tableCheck.rows[0].table_exists) {
      console.log('✅ Licenses table exists');
      
      // Get table info
      const tableInfo = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'licenses' 
        ORDER BY ordinal_position;
      `;
      
      console.log('\n📋 Table structure:');
      console.table(tableInfo.rows);
      
      // Test insert/delete
      console.log('\n🧪 Testing insert/delete operations...');
      const testRecord = {
        jurisdiction: 'TEST',
        idNumber: 'TEST123',
        firstName: 'Test',
        lastName: 'User',
        rawSource: 'pdf417' as const,
        confidence: 0.95
      };
      
      const insertResult = await sql`
        INSERT INTO licenses (mime_type, source, payload_raw, parsed_json, confidence)
        VALUES ('image/jpeg', 'test', 'test payload', ${JSON.stringify(testRecord)}::jsonb, 0.95)
        RETURNING id;
      `;
      
      const testId = insertResult.rows[0].id;
      console.log(`✅ Test record inserted with ID: ${testId}`);
      
      // Clean up
      await sql`DELETE FROM licenses WHERE id = ${testId}`;
      console.log('🧹 Test record cleaned up');
      
    } else {
      console.log('❌ Licenses table does not exist');
      console.log('💡 Run "npm run db:setup" to create the table');
    }
    
    console.log('\n🎉 Database test complete!');
    
  } catch (error) {
    console.error('❌ Database test failed:', (error as Error).message);
    console.error('\n💡 Make sure you have:');
    console.error('   - Vercel Postgres database configured');
    console.error('   - POSTGRES_URL environment variable set');
    console.error('   - Run "npm run db:setup" first');
    process.exit(1);
  }
}

testDatabase();
