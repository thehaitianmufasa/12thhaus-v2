const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Paysoz991%40%23%23%23@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkTableStructure() {
  const client = await pool.connect();
  try {
    console.log('🔍 Checking existing table structures...');
    
    // Check if spiritual_bookings table exists and its structure
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'twelthhaus' 
      AND table_name = 'spiritual_bookings'
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('📊 spiritual_bookings table exists. Checking columns...');
      
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'twelthhaus' 
        AND table_name = 'spiritual_bookings'
        ORDER BY ordinal_position
      `);
      
      console.log('\\n📋 Current spiritual_bookings columns:');
      columns.rows.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
      // Let's drop and recreate if needed
      console.log('\\n🔄 Dropping and recreating spiritual_bookings with correct schema...');
      await client.query('DROP TABLE IF EXISTS twelthhaus.spiritual_bookings CASCADE');
      
      await client.query(`
        CREATE TABLE twelthhaus.spiritual_bookings (
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
            session_type VARCHAR(20) NOT NULL DEFAULT 'remote' CHECK (
                session_type IN ('remote', 'in_person', 'hybrid')
            ),
            agreed_price DECIMAL(10,2) NOT NULL,
            payment_status VARCHAR(20) DEFAULT 'pending' CHECK (
                payment_status IN ('pending', 'paid', 'refunded', 'failed')
            ),
            meeting_location TEXT,
            meeting_link TEXT,
            seeker_preparation_notes TEXT,
            practitioner_session_notes TEXT,
            booking_source VARCHAR(20) DEFAULT 'web',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('✅ spiritual_bookings recreated with correct schema');
    } else {
      console.log('❌ spiritual_bookings table does not exist');
    }
    
    // Now add sample data
    console.log('\\n📅 Adding sample booking data...');
    
    const practitionerId = 'b8490dcc-d3db-4f8d-9cfa-3a567496d773';
    const seekerId = '4dfc345a-d4d8-4dc7-8046-deeaccbb93d5';
    
    // Get a service offering ID
    const serviceResult = await client.query('SELECT id FROM twelthhaus.service_offerings LIMIT 1');
    if (serviceResult.rows.length > 0) {
      const serviceId = serviceResult.rows[0].id;
      
      await client.query(`
        INSERT INTO twelthhaus.spiritual_bookings 
        (seeker_id, practitioner_id, service_offering_id, session_date, session_start_time, session_end_time, agreed_price, booking_status, session_type)
        VALUES 
        ($1, $2, $3, CURRENT_DATE + INTERVAL '2 days', '14:00', '15:30', 75.00, 'confirmed', 'remote'),
        ($1, $2, $3, CURRENT_DATE + INTERVAL '5 days', '10:00', '11:30', 120.00, 'pending', 'remote')
      `, [seekerId, practitionerId, serviceId]);
      
      console.log('✅ Sample bookings created');
      
      // Verify the data
      const bookings = await client.query(`
        SELECT sb.id, sb.session_date, sb.session_start_time, sb.booking_status, sb.agreed_price,
               u.full_name as seeker_name, so.title as service_title
        FROM twelthhaus.spiritual_bookings sb
        JOIN twelthhaus.users u ON sb.seeker_id = u.id
        JOIN twelthhaus.service_offerings so ON sb.service_offering_id = so.id
        ORDER BY sb.session_date
      `);
      
      console.log('\\n📊 Created bookings:');
      bookings.rows.forEach(booking => {
        console.log(`  ${booking.session_date} ${booking.session_start_time} - ${booking.service_title} - ${booking.seeker_name} - ${booking.booking_status} - $${booking.agreed_price}`);
      });
    }
    
    // Check all booking system tables
    const allTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'twelthhaus' 
      AND (table_name LIKE '%booking%' OR table_name LIKE '%availability%' OR table_name LIKE '%review%' OR table_name LIKE '%time_slot%')
      ORDER BY table_name
    `);
    
    console.log('\\n🗂️ All booking system tables:');
    allTables.rows.forEach(row => console.log(`  ✓ ${row.table_name}`));
    
    console.log('\\n🎯 Booking system database ready for GraphQL integration!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkTableStructure();