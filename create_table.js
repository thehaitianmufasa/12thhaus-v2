const { Pool } = require('pg');
const fs = require('fs');

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:Paysoz991%40%23%23%23@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function createServiceOfferingsTable() {
  const client = await pool.connect();
  try {
    // Read the SQL file
    const sql = fs.readFileSync('./create_service_offerings_table.sql', 'utf8');
    
    console.log('🔧 Creating service_offerings table...');
    
    // Execute the SQL
    await client.query(sql);
    
    console.log('✅ service_offerings table created successfully!');
    
    // Verify the table exists and has data
    const result = await client.query('SELECT COUNT(*) FROM twelthhaus.service_offerings');
    console.log(`📊 Created ${result.rows[0].count} sample service offerings`);
    
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createServiceOfferingsTable();