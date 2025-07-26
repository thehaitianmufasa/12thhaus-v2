const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:Paysoz991%40%23%23%23@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function createServiceOfferingsTable() {
  const client = await pool.connect();
  try {
    console.log('🔧 Creating service_offerings table...');
    
    // Create table without foreign key constraints first
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS twelthhaus.service_offerings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          practitioner_id UUID NOT NULL,
          spiritual_discipline_id INTEGER NOT NULL,
          title VARCHAR(200) NOT NULL,
          description TEXT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          pricing_model VARCHAR(20) NOT NULL DEFAULT 'fixed',
          duration_minutes INTEGER NOT NULL,
          is_remote BOOLEAN NOT NULL DEFAULT true,
          is_in_person BOOLEAN NOT NULL DEFAULT false,
          location_details TEXT,
          max_participants INTEGER DEFAULT 1,
          requirements TEXT,
          preparation_instructions TEXT,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await client.query(createTableSQL);
    console.log('✅ service_offerings table created!');
    
    // Add indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_service_offerings_practitioner ON twelthhaus.service_offerings(practitioner_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_service_offerings_discipline ON twelthhaus.service_offerings(spiritual_discipline_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_service_offerings_active ON twelthhaus.service_offerings(is_active)');
    console.log('✅ Indexes created!');
    
    // Get a practitioner ID for sample data
    const practitionerResult = await client.query('SELECT id FROM twelthhaus.practitioners LIMIT 1');
    if (practitionerResult.rows.length === 0) {
      console.log('❌ No practitioners found, skipping sample data');
      return;
    }
    
    const practitionerId = practitionerResult.rows[0].id;
    console.log('📋 Using practitioner ID:', practitionerId);
    
    // Insert sample data
    const insertSQL = `
      INSERT INTO twelthhaus.service_offerings (
          practitioner_id, 
          spiritual_discipline_id, 
          title, 
          description, 
          price, 
          pricing_model, 
          duration_minutes, 
          is_remote, 
          is_in_person, 
          requirements
      ) VALUES 
      ($1, 2, 'Intuitive Tarot Reading Session', 'A comprehensive tarot reading focused on your current life path, challenges, and opportunities.', 75.00, 'fixed', 60, true, true, 'Please come with specific questions or areas of focus.'),
      ($1, 3, 'Distance Reiki Healing Session', 'A powerful remote Reiki healing session to balance your energy centers and promote healing.', 65.00, 'sliding_scale', 45, true, false, 'Please be in a comfortable, quiet space during the scheduled time.'),
      ($1, 6, 'Complete Chakra Assessment & Balancing', 'In-depth chakra analysis with personalized healing recommendations.', 120.00, 'fixed', 90, true, true, 'Comfortable clothing recommended.')
      ON CONFLICT DO NOTHING;
    `;
    
    await client.query(insertSQL, [practitionerId]);
    
    // Verify the table exists and has data
    const result = await client.query('SELECT COUNT(*) FROM twelthhaus.service_offerings');
    console.log(`📊 Created ${result.rows[0].count} service offerings`);
    
    // Show sample data
    const sampleResult = await client.query('SELECT title, price, duration_minutes FROM twelthhaus.service_offerings LIMIT 3');
    console.log('📋 Sample services:');
    sampleResult.rows.forEach(row => {
      console.log(`  - ${row.title}: $${row.price} (${row.duration_minutes}min)`);
    });
    
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createServiceOfferingsTable();