const { Pool } = require('pg');
const fs = require('fs');

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:Paysoz991%40%23%23%23@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function createBookingTables() {
  const client = await pool.connect();
  try {
    console.log('🗓️ Creating booking & scheduling system tables...');
    
    // Read the SQL schema file
    const sql = fs.readFileSync('./booking_schema_design.sql', 'utf8');
    
    // Execute the complete schema
    await client.query(sql);
    
    console.log('✅ Booking system tables created successfully!');
    
    // Verify tables exist
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'twelthhaus' 
      AND table_name LIKE '%booking%' OR table_name LIKE '%availability%' 
      OR table_name LIKE '%time_slot%' OR table_name LIKE '%review%'
      ORDER BY table_name
    `);
    
    console.log('📊 Created booking system tables:');
    tableCheck.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    // Add sample practitioner availability for our test practitioner
    console.log('\n📅 Creating sample practitioner availability...');
    
    const practitionerId = 'b8490dcc-d3db-4f8d-9cfa-3a567496d773'; // Our test practitioner
    
    // Create recurring availability (Monday-Friday, 9 AM - 5 PM EST)
    await client.query(`
      INSERT INTO twelthhaus.practitioner_availability 
      (practitioner_id, day_of_week, start_time, end_time, timezone)
      VALUES 
      ($1, 1, '09:00', '17:00', 'America/New_York'), -- Monday
      ($1, 2, '09:00', '17:00', 'America/New_York'), -- Tuesday  
      ($1, 3, '09:00', '17:00', 'America/New_York'), -- Wednesday
      ($1, 4, '09:00', '17:00', 'America/New_York'), -- Thursday
      ($1, 5, '09:00', '17:00', 'America/New_York')  -- Friday
      ON CONFLICT DO NOTHING
    `, [practitionerId]);
    
    // Create specific time slots for the next 7 days
    console.log('⏰ Creating time slots for next 7 days...');
    
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const slotDate = new Date(today);
      slotDate.setDate(today.getDate() + i);
      const dateStr = slotDate.toISOString().split('T')[0];
      
      // Skip weekends for this example
      if (slotDate.getDay() !== 0 && slotDate.getDay() !== 6) {
        // Create morning and afternoon slots
        const timeSlots = [
          { start: '09:00', end: '10:30' },
          { start: '11:00', end: '12:30' },
          { start: '14:00', end: '15:30' },
          { start: '16:00', end: '17:30' }
        ];
        
        for (const slot of timeSlots) {
          await client.query(`
            INSERT INTO twelthhaus.practitioner_time_slots 
            (practitioner_id, slot_date, start_time, end_time, timezone, is_available)
            VALUES ($1, $2, $3, $4, 'America/New_York', true)
            ON CONFLICT DO NOTHING
          `, [practitionerId, dateStr, slot.start, slot.end]);
        }
      }
    }
    
    // Verify sample data
    const availabilityCount = await client.query(
      'SELECT COUNT(*) FROM twelthhaus.practitioner_availability WHERE practitioner_id = $1',
      [practitionerId]
    );
    
    const timeSlotsCount = await client.query(
      'SELECT COUNT(*) FROM twelthhaus.practitioner_time_slots WHERE practitioner_id = $1',
      [practitionerId]
    );
    
    console.log(`✅ Created ${availabilityCount.rows[0].count} recurring availability patterns`);
    console.log(`✅ Created ${timeSlotsCount.rows[0].count} specific time slots`);
    
    // Show sample availability
    const sampleSlots = await client.query(`
      SELECT slot_date, start_time, end_time, is_available
      FROM twelthhaus.practitioner_time_slots 
      WHERE practitioner_id = $1 
      ORDER BY slot_date, start_time 
      LIMIT 5
    `, [practitionerId]);
    
    console.log('\n📋 Sample available time slots:');
    sampleSlots.rows.forEach(slot => {
      console.log(`  ${slot.slot_date} ${slot.start_time}-${slot.end_time} ${slot.is_available ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating booking tables:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createBookingTables();