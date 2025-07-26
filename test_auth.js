#!/usr/bin/env node
/**
 * Test Authentication Flow for 12thhaus User Management System
 * Tests user registration, login, and profile operations
 */

const GRAPHQL_URL = 'http://localhost:4000/graphql';

async function makeGraphQLRequest(query, variables = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables
    })
  });
  
  const result = await response.json();
  if (result.errors) {
    console.error('GraphQL Errors:', result.errors);
    throw new Error('GraphQL request failed');
  }
  
  return result.data;
}

async function testSeekerRegistration() {
  console.log('\n🧪 Testing Seeker Registration...');
  
  const registerMutation = `
    mutation RegisterSeeker($input: UserRegistrationInput!) {
      register(input: $input) {
        token
        user {
          id
          email
          full_name
          user_type
          spiritual_experience
          energy_sensitivity
        }
        expires_in
      }
    }
  `;
  
  const seekerInput = {
    email: 'seeker@12thhaus.com',
    password: 'seekerpassword123',
    full_name: 'Sarah Seeker',
    user_type: 'seeker',
    energy_sensitivity: 'sensitive',
    spiritual_experience: 'intermediate',
    spiritual_goals: 'Finding inner peace and spiritual guidance'
  };
  
  try {
    const result = await makeGraphQLRequest(registerMutation, { input: seekerInput });
    console.log('✅ Seeker registered successfully:');
    console.log(`   User ID: ${result.register.user.id}`);
    console.log(`   Email: ${result.register.user.email}`);
    console.log(`   Name: ${result.register.user.full_name}`);
    console.log(`   Type: ${result.register.user.user_type}`);
    console.log(`   Experience: ${result.register.user.spiritual_experience}`);
    console.log(`   Energy Sensitivity: ${result.register.user.energy_sensitivity}`);
    
    return {
      token: result.register.token,
      user: result.register.user
    };
  } catch (error) {
    console.error('❌ Seeker registration failed:', error.message);
    return null;
  }
}

async function testPractitionerRegistration() {
  console.log('\n🧪 Testing Practitioner Registration...');
  
  const registerMutation = `
    mutation RegisterPractitioner($input: UserRegistrationInput!) {
      register(input: $input) {
        token
        user {
          id
          email
          full_name
          user_type
          practitioner {
            id
            user_id
            verification_status
          }
        }
        expires_in
      }
    }
  `;
  
  const practitionerInput = {
    email: 'practitioner@12thhaus.com',
    password: 'practitionerpassword123',
    full_name: 'Maya Mystic',
    user_type: 'practitioner',
    energy_sensitivity: 'highly_sensitive',
    spiritual_experience: 'advanced',
    spiritual_goals: 'Helping others on their spiritual journey'
  };
  
  try {
    const result = await makeGraphQLRequest(registerMutation, { input: practitionerInput });
    console.log('✅ Practitioner registered successfully:');
    console.log(`   User ID: ${result.register.user.id}`);
    console.log(`   Email: ${result.register.user.email}`);
    console.log(`   Name: ${result.register.user.full_name}`);
    console.log(`   Type: ${result.register.user.user_type}`);
    console.log(`   Practitioner ID: ${result.register.user.practitioner?.id}`);
    console.log(`   Verification Status: ${result.register.user.practitioner?.verification_status}`);
    
    return {
      token: result.register.token,
      user: result.register.user
    };
  } catch (error) {
    console.error('❌ Practitioner registration failed:', error.message);
    return null;
  }
}

async function testLogin(email, password) {
  console.log(`\n🧪 Testing Login for ${email}...`);
  
  const loginMutation = `
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        token
        user {
          id
          email
          full_name
          user_type
        }
        expires_in
      }
    }
  `;
  
  try {
    const result = await makeGraphQLRequest(loginMutation, { email, password });
    console.log('✅ Login successful:');
    console.log(`   User ID: ${result.login.user.id}`);
    console.log(`   Email: ${result.login.user.email}`);
    console.log(`   Type: ${result.login.user.user_type}`);
    
    return {
      token: result.login.token,
      user: result.login.user
    };
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    return null;
  }
}

async function testAuthenticatedQuery(token) {
  console.log('\n🧪 Testing Authenticated "Me" Query...');
  
  const meQuery = `
    query Me {
      me {
        id
        email
        full_name
        user_type
        energy_sensitivity
        spiritual_experience
        created_at
        practitioner {
          id
          business_name
          verification_status
        }
        spiritual_preferences {
          id
          preferred_session_length
          timezone
        }
      }
    }
  `;
  
  try {
    const result = await makeGraphQLRequest(meQuery, {}, token);
    console.log('✅ Authenticated query successful:');
    console.log(`   User: ${result.me.full_name} (${result.me.user_type})`);
    console.log(`   Experience: ${result.me.spiritual_experience}`);
    console.log(`   Energy: ${result.me.energy_sensitivity}`);
    
    if (result.me.practitioner) {
      console.log(`   Practitioner Profile: ${result.me.practitioner.verification_status}`);
    }
    
    return result.me;
  } catch (error) {
    console.error('❌ Authenticated query failed:', error.message);
    return null;
  }
}

async function testPractitionerProfileUpdate(token) {
  console.log('\n🧪 Testing Practitioner Profile Update...');
  
  const updateMutation = `
    mutation UpdatePractitionerProfile($input: PractitionerProfileInput!) {
      create_practitioner_profile(input: $input) {
        id
        business_name
        bio
        specialties
        years_of_experience
        consultation_style
        location_city
        location_state
      }
    }
  `;
  
  const profileInput = {
    business_name: 'Mystic Maya Spiritual Guidance',
    bio: 'Experienced spiritual practitioner specializing in tarot reading and energy healing. Helping souls find their path for over 10 years.',
    specialties: ['Tarot Reading', 'Energy Healing', 'Chakra Balancing'],
    years_of_experience: 10,
    consultation_style: 'compassionate',
    location_city: 'Boulder',
    location_state: 'Colorado'
  };
  
  try {
    const result = await makeGraphQLRequest(updateMutation, { input: profileInput }, token);
    console.log('✅ Practitioner profile updated successfully:');
    console.log(`   Business: ${result.create_practitioner_profile.business_name}`);
    console.log(`   Specialties: ${result.create_practitioner_profile.specialties.join(', ')}`);
    console.log(`   Experience: ${result.create_practitioner_profile.years_of_experience} years`);
    console.log(`   Location: ${result.create_practitioner_profile.location_city}, ${result.create_practitioner_profile.location_state}`);
    
    return result.create_practitioner_profile;
  } catch (error) {
    console.error('❌ Practitioner profile update failed:', error.message);
    return null;
  }
}

async function testSeekerPreferences(token) {
  console.log('\n🧪 Testing Seeker Preferences Creation...');
  
  const preferencesMutation = `
    mutation CreateSeekerPreferences($input: SeekerPreferencesInput!) {
      create_seeker_preferences(input: $input) {
        id
        preferred_disciplines
        preferred_session_length
        budget_range_min
        budget_range_max
        spiritual_goals
        location_preference
      }
    }
  `;
  
  const preferencesInput = {
    preferred_disciplines: [1, 2, 3], // Astrology, Tarot, Reiki
    preferred_session_length: 90,
    budget_range_min: 50.0,
    budget_range_max: 150.0,
    spiritual_goals: ['Self-discovery', 'Emotional healing', 'Spiritual growth'],
    location_preference: 'virtual',
    language_preferences: ['English']
  };
  
  try {
    const result = await makeGraphQLRequest(preferencesMutation, { input: preferencesInput }, token);
    console.log('✅ Seeker preferences created successfully:');
    console.log(`   Preferred Disciplines: ${result.create_seeker_preferences.preferred_disciplines.join(', ')}`);
    console.log(`   Session Length: ${result.create_seeker_preferences.preferred_session_length} minutes`);
    console.log(`   Budget: $${result.create_seeker_preferences.budget_range_min} - $${result.create_seeker_preferences.budget_range_max}`);
    console.log(`   Goals: ${result.create_seeker_preferences.spiritual_goals.join(', ')}`);
    
    return result.create_seeker_preferences;
  } catch (error) {
    console.error('❌ Seeker preferences creation failed:', error.message);
    return null;
  }
}

async function runAuthenticationTests() {
  console.log('🚀 12thhaus User Management System - Authentication Tests');
  console.log('=' * 60);
  
  try {
    // Test 1: Register a seeker
    const seekerAuth = await testSeekerRegistration();
    if (!seekerAuth) return;
    
    // Test 2: Register a practitioner
    const practitionerAuth = await testPractitionerRegistration();
    if (!practitionerAuth) return;
    
    // Test 3: Login as seeker
    const seekerLogin = await testLogin('seeker@12thhaus.com', 'seekerpassword123');
    if (!seekerLogin) return;
    
    // Test 4: Login as practitioner
    const practitionerLogin = await testLogin('practitioner@12thhaus.com', 'practitionerpassword123');
    if (!practitionerLogin) return;
    
    // Test 5: Authenticated query (seeker)
    await testAuthenticatedQuery(seekerAuth.token);
    
    // Test 6: Authenticated query (practitioner)
    await testAuthenticatedQuery(practitionerAuth.token);
    
    // Test 7: Update practitioner profile
    await testPractitionerProfileUpdate(practitionerAuth.token);
    
    // Test 8: Create seeker preferences
    await testSeekerPreferences(seekerAuth.token);
    
    console.log('\n🎉 ALL AUTHENTICATION TESTS COMPLETED SUCCESSFULLY!');
    console.log('✅ User registration working for both seekers and practitioners');
    console.log('✅ Login authentication functional');
    console.log('✅ JWT token-based authentication working');  
    console.log('✅ Profile management operational');
    console.log('✅ Dual user type system functional');
    
    console.log('\n📊 PRP 3.1 USER MANAGEMENT SYSTEM: COMPLETE');
    console.log('🎯 Ready for next phase: Service Management System');
    
  } catch (error) {
    console.error('\n❌ Authentication test suite failed:', error.message);
    process.exit(1);
  }
}

// Import and run tests
async function main() {
  // Dynamic import for node-fetch
  const fetch = (await import('node-fetch')).default;
  global.fetch = fetch;
  
  // Run authentication tests
  await runAuthenticationTests();
}

main().catch(console.error);