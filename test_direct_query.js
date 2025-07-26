const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Paysoz991%40%23%23%23@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function testQuery() {
  const client = await pool.connect();
  try {
    console.log('🔍 Testing direct queries...');
    
    // Test service_offerings table directly
    console.log('\n📊 Service Offerings:');
    const serviceResult = await client.query('SELECT * FROM twelthhaus.service_offerings LIMIT 3');
    console.log(`Found ${serviceResult.rows.length} service offerings`);
    serviceResult.rows.forEach(row => {
      console.log(`  - ${row.title} (${row.id})`);
      console.log(`    Practitioner ID: ${row.practitioner_id} (${typeof row.practitioner_id})`);
      console.log(`    Discipline ID: ${row.spiritual_discipline_id} (${typeof row.spiritual_discipline_id})`);
    });
    
    // Test JOIN issue
    console.log('\n🔗 Testing JOIN:');
    try {
      const joinResult = await client.query(`
        SELECT so.title, so.practitioner_id, so.spiritual_discipline_id,
               p.business_name, sd.name as discipline_name
        FROM twelthhaus.service_offerings so
        JOIN twelthhaus.practitioners p ON so.practitioner_id = p.id
        JOIN twelthhaus.spiritual_disciplines sd ON so.spiritual_discipline_id = sd.id
        LIMIT 1
      `);
      console.log('✅ JOIN successful!');
      console.log(joinResult.rows[0]);
    } catch (error) {
      console.log('❌ JOIN error:', error.message);
      
      // Test individual joins
      console.log('\n🧪 Testing practitioner join only:');
      try {
        const practitionerJoin = await client.query(`
          SELECT so.title, p.business_name
          FROM twelthhaus.service_offerings so
          JOIN twelthhaus.practitioners p ON so.practitioner_id = p.id
          LIMIT 1
        `);
        console.log('✅ Practitioner JOIN works:', practitionerJoin.rows[0]);
      } catch (err) {
        console.log('❌ Practitioner JOIN fails:', err.message);
      }
      
      console.log('\n🧪 Testing discipline join only:');
      try {
        const disciplineJoin = await client.query(`
          SELECT so.title, sd.name as discipline_name, so.spiritual_discipline_id, sd.id
          FROM twelthhaus.service_offerings so
          JOIN twelthhaus.spiritual_disciplines sd ON so.spiritual_discipline_id = sd.id
          LIMIT 1
        `);
        console.log('✅ Discipline JOIN works:', disciplineJoin.rows[0]);
      } catch (err) {
        console.log('❌ Discipline JOIN fails:', err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

testQuery();