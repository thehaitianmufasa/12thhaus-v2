const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:Paysoz991%40%23%23%23@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

// Seed data for practitioners
const practitionerProfiles = [
  {
    email: 'maya@mysticmaya.com',
    name: 'Maya Rodriguez',
    businessName: 'Mystic Maya Spiritual Guidance',
    bio: 'Former corporate executive who found her calling after a transformative spiritual awakening during a difficult life transition. Now I help ambitious souls navigate life\'s biggest decisions with tarot wisdom and intuitive guidance. My approach blends practical insight with deep spiritual truth.',
    location: 'Boulder, Colorado',
    specialties: ['Tarot Reading', 'Energy Healing', 'Chakra Balancing'],
    yearsExperience: 10,
    certifications: ['Certified Reiki Master', 'Professional Tarot Reader (ATA)', 'Life Coach Certification (ICF)'],
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    rating: 4.9,
    totalSessions: 287,
    totalReviews: 156
  },
  {
    email: 'keisha@sacredhealing.com',
    name: 'Dr. Keisha Johnson',
    businessName: 'Sacred Healing Arts',
    bio: 'Licensed therapist who discovered the profound healing power of Reiki during my own healing journey from burnout. I combine my clinical training with energy healing to help people heal trauma stored in both mind and body. Every session is a sacred space for transformation.',
    location: 'Sedona, Arizona',
    specialties: ['Reiki Healing', 'Crystal Therapy', 'Meditation', 'Trauma Healing'],
    yearsExperience: 15,
    certifications: ['Licensed Clinical Therapist (LCSW)', 'Reiki Master Teacher', 'Crystal Healing Certification'],
    profileImage: 'https://images.unsplash.com/photo-1594824980346-375852386693?w=400&h=400&fit=crop&crop=face',
    rating: 4.8,
    totalSessions: 412,
    totalReviews: 203
  },
  {
    email: 'sarah@cosmicinsights.com',
    name: 'Sarah Chen',
    businessName: 'Cosmic Insights Astrology',
    bio: 'Astrology saved my life - literally. When I was lost and struggling with depression, understanding my birth chart gave me the roadmap home to myself. Now I help others discover their cosmic blueprint and remember why their soul chose this particular lifetime.',
    location: 'Portland, Oregon',
    specialties: ['Natal Charts', 'Transit Readings', 'Relationship Astrology', 'Evolutionary Astrology'],
    yearsExperience: 8,
    certifications: ['Certified Professional Astrologer (ISAR)', 'Psychological Astrology Diploma'],
    profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    rating: 4.9,
    totalSessions: 198,
    totalReviews: 128
  },
  {
    email: 'sophia@radiantsoul.com',
    name: 'Sophia Williams',
    businessName: 'Radiant Soul Coaching',
    bio: 'After leaving a toxic relationship and rebuilding my entire life from scratch, I learned that true love starts with loving yourself first. I help women (and men!) break free from people-pleasing patterns, set healthy boundaries, and step into their authentic power in all relationships.',
    location: 'Austin, Texas',
    specialties: ['Life Coaching', 'Relationship Guidance', 'Self-Love', 'Boundary Setting'],
    yearsExperience: 6,
    certifications: ['Certified Life Coach (ICF)', 'Energy Healing Practitioner', 'Relationship Coach'],
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    rating: 4.7,
    totalSessions: 156,
    totalReviews: 89
  },
  {
    email: 'michael@innerlight.com',
    name: 'Michael Thompson',
    businessName: 'Inner Light Healing',
    bio: 'My shamanic training began after a near-death experience opened my perception to non-ordinary reality. I\'ve spent years studying with indigenous healers and medicine carriers. I help people retrieve lost soul parts and reconnect with their spiritual power and purpose.',
    location: 'Santa Fe, New Mexico',
    specialties: ['Shamanic Healing', 'Sound Therapy', 'Soul Retrieval', 'Spiritual Cleansing'],
    yearsExperience: 12,
    certifications: ['Shamanic Practitioner Certificate', 'Sound Healing Certification', 'Indigenous Healing Training'],
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    rating: 4.8,
    totalSessions: 234,
    totalReviews: 142
  },
  {
    email: 'anna@peacefulmind.com',
    name: 'Anna Lopez',
    businessName: 'Peaceful Mind Meditation',
    bio: 'Meditation literally saved my sanity during my high-stress corporate days. What started as a desperate attempt to manage anxiety became a profound spiritual practice. I love teaching busy people that you don\'t need hours of perfect silence - just a willingness to begin.',
    location: 'San Diego, California',
    specialties: ['Guided Meditation', 'Mindfulness', 'Stress Relief', 'Corporate Wellness'],
    yearsExperience: 5,
    certifications: ['Certified Mindfulness Instructor (MBSR)', 'Meditation Teacher Training', 'Corporate Wellness Coach'],
    profileImage: 'https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?w=400&h=400&fit=crop&crop=face',
    rating: 4.6,
    totalSessions: 178,
    totalReviews: 94
  },
  {
    email: 'david@crystalwisdom.com',
    name: 'David Kumar',
    businessName: 'Crystal Wisdom Healing',
    bio: 'I discovered crystal healing during my travels through India and Tibet. These ancient stones hold frequencies that can shift our energy in profound ways. I\'ve spent years learning which crystals work best for different healing needs and how to program them for maximum benefit.',
    location: 'Asheville, North Carolina',
    specialties: ['Crystal Healing', 'Gemstone Therapy', 'Chakra Balancing', 'Energy Clearing'],
    yearsExperience: 9,
    certifications: ['Master Crystal Healer', 'Gemstone Therapy Certification', 'Energy Healing Practitioner'],
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    rating: 4.7,
    totalSessions: 167,
    totalReviews: 98
  },
  {
    email: 'maria@holisticpath.com',
    name: 'Maria Santos',
    businessName: 'Holistic Path Wellness',
    bio: 'Growing up with my abuela\'s folk healing remedies, I learned early that everything in nature has medicine to offer. I blend traditional plant wisdom with modern aromatherapy and holistic practices to help people heal naturally and reconnect with the earth\'s pharmacy.',
    location: 'Miami, Florida',
    specialties: ['Holistic Healing', 'Aromatherapy', 'Herbal Medicine', 'Wellness Coaching'],
    yearsExperience: 11,
    certifications: ['Certified Holistic Health Practitioner', 'Aromatherapy Certification', 'Herbal Medicine Diploma'],
    profileImage: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&h=400&fit=crop&crop=face',
    rating: 4.8,
    totalSessions: 203,
    totalReviews: 124
  },
  {
    email: 'james@awakening.com',
    name: 'James Wilson',
    businessName: 'Awakening Spiritual Guidance',
    bio: 'Past-life regression changed everything for me when I discovered why I had certain phobias and relationship patterns. Understanding our soul\'s journey across lifetimes brings such healing and clarity. I help people uncover their soul contracts and break free from karmic loops.',
    location: 'Mount Shasta, California',
    specialties: ['Past Life Regression', 'Spiritual Counseling', 'Karmic Healing', 'Soul Purpose'],
    yearsExperience: 14,
    certifications: ['Certified Past Life Regression Therapist', 'Spiritual Counselor', 'Karmic Healing Practitioner'],
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
    rating: 4.9,
    totalSessions: 289,
    totalReviews: 178
  }
];

// Seed data for seekers
const seekerProfiles = [
  {
    email: 'sarah.j@email.com',
    name: 'Sarah Johnson',
    bio: 'Started my spiritual journey after a difficult divorce left me questioning everything. Tarot and energy healing have become my anchors through life\'s storms. This community has shown me I\'m not alone on this path of rediscovering who I truly am.',
    location: 'San Francisco, California',
    interests: ['Tarot Reading', 'Reiki Healing', 'Meditation', 'Chakra Balancing'],
    experience: 'intermediate',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=400&h=400&fit=crop&crop=face'
  },
  {
    email: 'jennifer.m@email.com',
    name: 'Jennifer Martinez',
    bio: 'I used to roll my eyes at "woo-woo" stuff until chronic pain led me to try energy healing as a last resort. That first Reiki session changed everything. Now I\'m exploring all the healing modalities that Western medicine never taught me about.',
    location: 'Austin, Texas',
    interests: ['Chakra Healing', 'Energy Work', 'Crystal Therapy', 'Meditation'],
    experience: 'beginner',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
  },
  {
    email: 'michael.k@email.com',
    name: 'Michael Kim',
    bio: 'Software engineer by day, spiritual seeker by night. After years of 80-hour weeks and anxiety attacks, I\'m learning there\'s more to life than code and deadlines. Meditation is slowly teaching me how to find peace in the chaos.',
    location: 'Seattle, Washington',
    interests: ['Meditation', 'Mindfulness', 'Energy Healing', 'Stress Relief'],
    experience: 'beginner',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
  },
  {
    email: 'emily.r@email.com',
    name: 'Emily Rodriguez',
    bio: 'Visual artist who found that my creativity flows best when I\'m connected to something greater than myself. Astrology and tarot have become part of my creative process - they help me understand the cosmic influences on my art and life.',
    location: 'Santa Fe, New Mexico',
    interests: ['Tarot Reading', 'Astrology', 'Creative Expression', 'Spiritual Art'],
    experience: 'intermediate',
    profileImage: 'https://images.unsplash.com/photo-1554727242-741c14fa561c?w=400&h=400&fit=crop&crop=face'
  },
  {
    email: 'david.l@email.com',
    name: 'David Liu',
    bio: 'Built a successful startup but felt spiritually empty. Now I\'m learning how to run a business that serves both profit and purpose. Looking for guidance on how to lead with consciousness and create work that truly matters.',
    location: 'Los Angeles, California',
    interests: ['Life Coaching', 'Spiritual Leadership', 'Business Alignment', 'Purpose Work'],
    experience: 'advanced',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
  },
  {
    email: 'lisa.t@email.com',
    name: 'Lisa Thompson',
    bio: 'Elementary school teacher and mom who grew up disconnected from nature. My kids are teaching me to see magic in the everyday world again. Slowly learning about plant medicine, crystals, and how to honor the earth\'s wisdom.',
    location: 'Denver, Colorado',
    interests: ['Crystal Healing', 'Herbalism', 'Nature Spirituality', 'Earth Connection'],
    experience: 'beginner',
    profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face'
  },
  {
    email: 'robert.g@email.com',
    name: 'Robert Garcia',
    bio: 'Iraq War veteran working on healing invisible wounds. Traditional therapy helped, but meditation and energy work are reaching parts of my soul I didn\'t know needed healing. Grateful for practitioners who understand trauma.',
    location: 'Phoenix, Arizona',
    interests: ['Meditation', 'Energy Healing', 'PTSD Healing', 'Trauma Recovery'],
    experience: 'intermediate',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face'
  },
  {
    email: 'amanda.w@email.com',
    name: 'Amanda White',
    bio: 'Yoga teacher who realized that physical poses are just the beginning. Diving deeper into breathwork, energy healing, and the spiritual roots of yoga. My practice has become a journey of remembering who I really am.',
    location: 'Asheville, North Carolina',
    interests: ['Breathwork', 'Movement Therapy', 'Spiritual Yoga', 'Body-Mind Connection'],
    experience: 'advanced',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'
  },
  {
    email: 'carlos.m@email.com',
    name: 'Carlos Mendez',
    bio: 'Music producer who had a mystical experience during a sound bath that changed everything. Now I\'m exploring how frequency and vibration can heal trauma and open hearts. Music is medicine, and I\'m learning to be a healer.',
    location: 'Nashville, Tennessee',
    interests: ['Sound Healing', 'Music Therapy', 'Frequency Healing', 'Vibrational Medicine'],
    experience: 'intermediate',
    profileImage: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=400&fit=crop&crop=face'
  }
];

// Services data for practitioners
const servicesData = [
  // Maya Rodriguez services
  {
    practitionerEmail: 'maya@mysticmaya.com',
    title: 'Intuitive Tarot Reading',
    description: 'Deep insights into your spiritual path through intuitive tarot guidance.',
    price: 75,
    duration: 60,
    category: 'divination',
    sessionTypes: ['Remote', 'In-Person']
  },
  {
    practitionerEmail: 'maya@mysticmaya.com',
    title: 'Energy Healing Session',
    description: 'Experience deep healing through universal life force energy.',
    price: 95,
    duration: 75,
    category: 'energy_healing',
    sessionTypes: ['Remote', 'In-Person']
  },
  // Dr. Keisha Johnson services
  {
    practitionerEmail: 'keisha@sacredhealing.com',
    title: 'Distance Reiki Healing',
    description: 'Experience deep healing and energy balancing through universal life force energy.',
    price: 65,
    duration: 45,
    category: 'energy_healing',
    sessionTypes: ['Remote']
  },
  {
    practitionerEmail: 'keisha@sacredhealing.com',
    title: 'Chakra Balancing Session',
    description: 'Align and balance your energy centers for optimal physical, emotional, and spiritual wellbeing.',
    price: 120,
    duration: 90,
    category: 'energy_healing',
    sessionTypes: ['In-Person']
  },
  // Sarah Chen services
  {
    practitionerEmail: 'sarah@cosmicinsights.com',
    title: 'Complete Natal Chart Reading',
    description: 'Discover your cosmic blueprint and life purpose through comprehensive birth chart analysis.',
    price: 150,
    duration: 90,
    category: 'astrology',
    sessionTypes: ['Remote', 'In-Person']
  },
  {
    practitionerEmail: 'sarah@cosmicinsights.com',
    title: 'Relationship Compatibility Reading',
    description: 'Explore relationship dynamics and compatibility through astrological analysis.',
    price: 120,
    duration: 60,
    category: 'astrology',
    sessionTypes: ['Remote']
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Insert practitioners
    console.log('👥 Seeding practitioners...');
    for (const practitioner of practitionerProfiles) {
      try {
        // Insert user
        const userResult = await pool.query(
          `INSERT INTO twelthhaus.users (email, password_hash, full_name, user_type, created_at, updated_at) 
           VALUES ($1, $2, $3, 'practitioner', NOW(), NOW()) 
           ON CONFLICT (email) DO NOTHING
           RETURNING id`,
          [practitioner.email, hashedPassword, practitioner.name]
        );

        if (userResult.rows.length > 0) {
          const userId = userResult.rows[0].id;

          // Insert practitioner profile
          await pool.query(
            `INSERT INTO twelthhaus.practitioners 
             (user_id, business_name, bio, location_city, specialties, years_of_experience, certifications, profile_image_url, rating, total_sessions, total_reviews, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
             ON CONFLICT (user_id) DO NOTHING`,
            [
              userId, 
              practitioner.businessName, 
              practitioner.bio, 
              practitioner.location,
              practitioner.specialties,
              practitioner.yearsExperience,
              practitioner.certifications,
              practitioner.profileImage,
              practitioner.rating,
              practitioner.totalSessions,
              practitioner.totalReviews
            ]
          );

          console.log(`✅ Added practitioner: ${practitioner.name}`);
        } else {
          console.log(`⚠️  User ${practitioner.email} already exists, not creating practitioner profile`);
        }
      } catch (error) {
        console.log(`❌ Error adding practitioner ${practitioner.name}:`, error.message);
      }
    }

    // Insert seekers
    console.log('🔍 Seeding seekers...');
    for (const seeker of seekerProfiles) {
      try {
        // Insert user
        const userResult = await pool.query(
          `INSERT INTO twelthhaus.users (email, password_hash, full_name, user_type, created_at, updated_at) 
           VALUES ($1, $2, $3, 'seeker', NOW(), NOW()) 
           ON CONFLICT (email) DO NOTHING
           RETURNING id`,
          [seeker.email, hashedPassword, seeker.name]
        );

        if (userResult.rows.length > 0) {
          const userId = userResult.rows[0].id;

          // Insert seeker preferences
          await pool.query(
            `INSERT INTO twelthhaus.seeker_preferences 
             (user_id, spiritual_interests, experience_level, profile_image_url, bio, location, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
             ON CONFLICT (user_id) DO NOTHING`,
            [
              userId,
              seeker.interests,
              seeker.experience,
              seeker.profileImage,
              seeker.bio,
              seeker.location
            ]
          );

          console.log(`✅ Added seeker: ${seeker.name}`);
        } else {
          console.log(`⚠️  User ${seeker.email} already exists, not creating seeker profile`);
        }
      } catch (error) {
        console.log(`❌ Error adding seeker ${seeker.name}:`, error.message);
      }
    }

    // Insert services
    console.log('🔮 Seeding services...');
    for (const service of servicesData) {
      try {
        // Get practitioner user ID
        const practitionerResult = await pool.query(
          'SELECT id FROM twelthhaus.users WHERE email = $1',
          [service.practitionerEmail]
        );

        if (practitionerResult.rows.length > 0) {
          const practitionerId = practitionerResult.rows[0].id;

          // Get spiritual discipline ID
          const disciplineResult = await pool.query(
            'SELECT id FROM twelthhaus.spiritual_disciplines WHERE category = $1 LIMIT 1',
            [service.category]
          );

          if (disciplineResult.rows.length > 0) {
            const disciplineId = disciplineResult.rows[0].id;

            const isRemote = service.sessionTypes.includes('Remote');
            const isInPerson = service.sessionTypes.includes('In-Person');

            await pool.query(
              `INSERT INTO twelthhaus.service_offerings 
               (practitioner_id, spiritual_discipline_id, title, description, price, duration_minutes, 
                is_remote, is_in_person, is_active, created_at, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())`,
              [
                practitionerId,
                disciplineId,
                service.title,
                service.description,
                service.price,
                service.duration,
                isRemote,
                isInPerson
              ]
            );

            console.log(`✅ Added service: ${service.title} for ${service.practitionerEmail}`);
          }
        }
      } catch (error) {
        console.log(`⚠️  Error adding service ${service.title}:`, error.message);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📊 Seeding Summary:
   • ${practitionerProfiles.length} Practitioners added
   • ${seekerProfiles.length} Seekers added  
   • ${servicesData.length} Services added
   • Default password for all users: password123
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

// Run the seeding
seedDatabase();