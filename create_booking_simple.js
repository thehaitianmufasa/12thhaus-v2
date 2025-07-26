const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:Paysoz991%40%23%23%23@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function createBookingTables() {
  const client = await pool.connect();
  try {
    console.log('🗓️ Creating booking & scheduling system tables...');
    
    // 1. Practitioner availability (recurring patterns)
    console.log('📅 Creating practitioner_availability table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS twelthhaus.practitioner_availability (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          practitioner_id UUID NOT NULL,
          day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          timezone VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 2. Time slots for booking
    console.log('⏰ Creating practitioner_time_slots table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS twelthhaus.practitioner_time_slots (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          practitioner_id UUID NOT NULL,
          service_offering_id UUID,
          slot_date DATE NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          timezone VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
          is_available BOOLEAN NOT NULL DEFAULT true,
          max_bookings INTEGER NOT NULL DEFAULT 1,
          current_bookings INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 3. Main bookings table
    console.log('📝 Creating spiritual_bookings table...');
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
          
          booking_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
              booking_status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')
          ),
          
          session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('remote', 'in_person', 'hybrid')),
          meeting_location TEXT,
          meeting_link TEXT,
          meeting_password TEXT,
          
          agreed_price DECIMAL(10,2) NOT NULL,
          payment_status VARCHAR(20) DEFAULT 'pending' CHECK (
              payment_status IN ('pending', 'paid', 'refunded', 'failed')
          ),
          
          seeker_preparation_notes TEXT,
          practitioner_session_notes TEXT,
          session_recording_url TEXT,
          session_summary TEXT,
          
          booked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          confirmed_at TIMESTAMP WITH TIME ZONE,
          completed_at TIMESTAMP WITH TIME ZONE,
          cancelled_at TIMESTAMP WITH TIME ZONE,
          cancellation_reason TEXT,
          
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 4. Reviews table
    console.log('⭐ Creating spiritual_reviews table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS twelthhaus.spiritual_reviews (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          booking_id UUID NOT NULL,
          reviewer_id UUID NOT NULL,
          practitioner_id UUID NOT NULL,
          
          overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
          accuracy_rating INTEGER CHECK (accuracy_rating BETWEEN 1 AND 5),
          clarity_rating INTEGER CHECK (clarity_rating BETWEEN 1 AND 5),
          connection_rating INTEGER CHECK (connection_rating BETWEEN 1 AND 5),
          value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
          
          review_title VARCHAR(200),
          review_content TEXT,
          
          is_anonymous BOOLEAN NOT NULL DEFAULT false,
          is_public BOOLEAN NOT NULL DEFAULT true,
          is_featured BOOLEAN NOT NULL DEFAULT false,
          
          practitioner_response TEXT,
          practitioner_responded_at TIMESTAMP WITH TIME ZONE,
          
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Add indexes
    console.log('📊 Creating performance indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_practitioner_availability_practitioner ON twelthhaus.practitioner_availability(practitioner_id);
      CREATE INDEX IF NOT EXISTS idx_time_slots_practitioner_date ON twelthhaus.practitioner_time_slots(practitioner_id, slot_date);
      CREATE INDEX IF NOT EXISTS idx_time_slots_available ON twelthhaus.practitioner_time_slots(is_available);
      CREATE INDEX IF NOT EXISTS idx_spiritual_bookings_seeker ON twelthhaus.spiritual_bookings(seeker_id);
      CREATE INDEX IF NOT EXISTS idx_spiritual_bookings_practitioner ON twelthhaus.spiritual_bookings(practitioner_id);
      CREATE INDEX IF NOT EXISTS idx_spiritual_bookings_date ON twelthhaus.spiritual_bookings(session_date);
      CREATE INDEX IF NOT EXISTS idx_spiritual_bookings_status ON twelthhaus.spiritual_bookings(booking_status);
      CREATE INDEX IF NOT EXISTS idx_spiritual_reviews_practitioner ON twelthhaus.spiritual_reviews(practitioner_id);
    `);
    
    console.log('✅ All booking system tables created successfully!');
    
    // Add sample data
    console.log('\n📅 Adding sample practitioner availability...');
    
    const practitionerId = 'b8490dcc-d3db-4f8d-9cfa-3a567496d773';
    
    // Recurring availability (Monday-Friday, 9 AM - 5 PM EST)
    await client.query(`
      INSERT INTO twelthhaus.practitioner_availability 
      (practitioner_id, day_of_week, start_time, end_time, timezone)
      VALUES 
      ($1, 1, '09:00', '17:00', 'America/New_York'),
      ($1, 2, '09:00', '17:00', 'America/New_York'),
      ($1, 3, '09:00', '17:00', 'America/New_York'),
      ($1, 4, '09:00', '17:00', 'America/New_York'),
      ($1, 5, '09:00', '17:00', 'America/New_York')
      ON CONFLICT DO NOTHING
    `, [practitionerId]);
    
    // Create time slots for next 7 days
    console.log('⏰ Creating available time slots...');
    
    const today = new Date();
    let slotsCreated = 0;
    
    for (let i = 1; i <= 7; i++) {
      const slotDate = new Date(today);
      slotDate.setDate(today.getDate() + i);
      const dateStr = slotDate.toISOString().split('T')[0];
      
      // Skip weekends
      if (slotDate.getDay() !== 0 && slotDate.getDay() !== 6) {
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
          slotsCreated++;
        }
      }
    }
    
    // Verify data
    const availabilityCount = await client.query(
      'SELECT COUNT(*) FROM twelthhaus.practitioner_availability WHERE practitioner_id = $1',
      [practitionerId]
    );
    
    const timeSlotsCount = await client.query(
      'SELECT COUNT(*) FROM twelthhaus.practitioner_time_slots WHERE practitioner_id = $1',
      [practitionerId]
    );
    
    console.log(`✅ Created ${availabilityCount.rows[0].count} recurring availability patterns`);
    console.log(`✅ Created ${timeSlotsCount.rows[0].count} available time slots`);
    
    // Show sample time slots
    const sampleSlots = await client.query(`
      SELECT slot_date, start_time, end_time, is_available
      FROM twelthhaus.practitioner_time_slots 
      WHERE practitioner_id = $1 AND is_available = true
      ORDER BY slot_date, start_time 
      LIMIT 8
    `, [practitionerId]);
    
    console.log('\\n📋 Available time slots for booking:');
    sampleSlots.rows.forEach(slot => {
      const date = new Date(slot.slot_date).toLocaleDateString();
      console.log(`  ${date} ${slot.start_time} - ${slot.end_time} EST`);
    });
    
    console.log('\\n🎯 Booking system ready for GraphQL integration!');
    
  } catch (error) {
    console.error('❌ Error creating booking tables:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createBookingTables();