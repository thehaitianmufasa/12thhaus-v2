const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/twelthhaus',
  ssl: { rejectUnauthorized: false }
});

async function createTablesOneByOne() {
  const client = await pool.connect();
  try {
    console.log('🔍 Creating booking tables one by one to debug...');
    
    // Test 1: Practitioner availability
    console.log('\\n1️⃣ Creating practitioner_availability...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS twelthhaus.practitioner_availability (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          practitioner_id UUID NOT NULL,
          day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          timezone VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ practitioner_availability created');
    
    // Test 2: Time slots
    console.log('\\n2️⃣ Creating practitioner_time_slots...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS twelthhaus.practitioner_time_slots (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          practitioner_id UUID NOT NULL,
          slot_date DATE NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          timezone VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
          is_available BOOLEAN NOT NULL DEFAULT true,
          max_bookings INTEGER NOT NULL DEFAULT 1,
          current_bookings INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ practitioner_time_slots created');
    
    // Test 3: Simple bookings table
    console.log('\\n3️⃣ Creating spiritual_bookings...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS twelthhaus.spiritual_bookings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          seeker_id UUID NOT NULL,
          practitioner_id UUID NOT NULL,
          service_offering_id UUID NOT NULL,
          time_slot_id UUID,
          session_date DATE NOT NULL,
          session_start_time TIME NOT NULL,
          session_end_time TIME NOT NULL,
          session_timezone VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
          booking_status VARCHAR(20) NOT NULL DEFAULT 'pending',
          session_type VARCHAR(20) NOT NULL DEFAULT 'remote',
          agreed_price DECIMAL(10,2) NOT NULL,
          payment_status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ spiritual_bookings created');
    
    // Test 4: Reviews
    console.log('\\n4️⃣ Creating spiritual_reviews...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS twelthhaus.spiritual_reviews (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          booking_id UUID NOT NULL,
          reviewer_id UUID NOT NULL,
          practitioner_id UUID NOT NULL,
          overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
          review_title VARCHAR(200),
          review_content TEXT,
          is_public BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ spiritual_reviews created');
    
    // Add sample data
    console.log('\\n📅 Adding sample data...');
    
    const practitionerId = 'b8490dcc-d3db-4f8d-9cfa-3a567496d773';
    const seekerId = '4dfc345a-d4d8-4dc7-8046-deeaccbb93d5';
    
    // Add availability
    await client.query(`
      INSERT INTO twelthhaus.practitioner_availability 
      (practitioner_id, day_of_week, start_time, end_time)
      VALUES 
      ($1, 1, '09:00', '17:00'),
      ($1, 2, '09:00', '17:00'),
      ($1, 3, '09:00', '17:00'),
      ($1, 4, '09:00', '17:00'),
      ($1, 5, '09:00', '17:00')
      ON CONFLICT DO NOTHING
    `, [practitionerId]);
    
    // Add time slots for next 3 days
    const today = new Date();
    for (let i = 1; i <= 3; i++) {
      const slotDate = new Date(today);
      slotDate.setDate(today.getDate() + i);
      const dateStr = slotDate.toISOString().split('T')[0];
      
      await client.query(`
        INSERT INTO twelthhaus.practitioner_time_slots 
        (practitioner_id, slot_date, start_time, end_time, is_available)
        VALUES 
        ($1, $2, '09:00', '10:30', true),
        ($1, $2, '11:00', '12:30', true),
        ($1, $2, '14:00', '15:30', true),
        ($1, $2, '16:00', '17:30', true)
        ON CONFLICT DO NOTHING
      `, [practitionerId, dateStr]);
    }
    
    // Create a sample booking
    const serviceId = await client.query('SELECT id FROM twelthhaus.service_offerings LIMIT 1');
    if (serviceId.rows.length > 0) {
      await client.query(`
        INSERT INTO twelthhaus.spiritual_bookings 
        (seeker_id, practitioner_id, service_offering_id, session_date, session_start_time, session_end_time, agreed_price, booking_status)
        VALUES ($1, $2, $3, CURRENT_DATE + INTERVAL '2 days', '14:00', '15:30', 75.00, 'confirmed')
        ON CONFLICT DO NOTHING
      `, [seekerId, practitionerId, serviceId.rows[0].id]);
      
      console.log('✅ Sample booking created');
    }
    
    // Check what we created
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'twelthhaus' 
      AND (table_name LIKE '%booking%' OR table_name LIKE '%availability%' OR table_name LIKE '%review%')
      ORDER BY table_name
    `);
    
    console.log('\\n📊 Created booking system tables:');
    tables.rows.forEach(row => console.log(`  ✓ ${row.table_name}`));
    
    // Show sample data
    const availability = await client.query(`
      SELECT day_of_week, start_time, end_time 
      FROM twelthhaus.practitioner_availability 
      WHERE practitioner_id = $1 
      ORDER BY day_of_week
    `, [practitionerId]);
    
    const timeSlots = await client.query(`
      SELECT slot_date, start_time, end_time 
      FROM twelthhaus.practitioner_time_slots 
      WHERE practitioner_id = $1 AND is_available = true 
      ORDER BY slot_date, start_time 
      LIMIT 5
    `, [practitionerId]);
    
    const bookings = await client.query(`
      SELECT session_date, session_start_time, booking_status, agreed_price
      FROM twelthhaus.spiritual_bookings 
      WHERE practitioner_id = $1
    `, [practitionerId]);
    
    console.log('\\n📋 Sample data created:');
    console.log(`  Availability patterns: ${availability.rows.length}`);
    console.log(`  Time slots: ${timeSlots.rows.length}`);
    console.log(`  Bookings: ${bookings.rows.length}`);
    
    if (timeSlots.rows.length > 0) {
      console.log('\\n⏰ Available time slots:');
      timeSlots.rows.forEach(slot => {
        console.log(`  ${slot.slot_date} ${slot.start_time}-${slot.end_time}`);
      });
    }
    
    if (bookings.rows.length > 0) {
      console.log('\\n📅 Sample bookings:');
      bookings.rows.forEach(booking => {
        console.log(`  ${booking.session_date} ${booking.session_start_time} - ${booking.booking_status} - $${booking.agreed_price}`);
      });
    }
    
    console.log('\\n🎯 Booking system tables ready!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

createTablesOneByOne();