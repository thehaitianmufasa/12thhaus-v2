
const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Stripe Connect Integration
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Set STRIPE_SECRET_KEY in environment variables

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/twelthhaus',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// JWT Secret - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || '12thhaus-spiritual-platform-secret-key';
const SALT_ROUNDS = 12;

// Authentication utilities
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      userType: user.user_type 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

const getAuthenticatedUser = (context) => {
  const authHeader = context.req?.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid authentication token provided');
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  return decoded;
};

// Database utility functions
const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateUserType = (userType) => {
  return ['seeker', 'practitioner'].includes(userType);
};

// GraphQL Type Definitions
const typeDefs = gql`
  # Core spiritual disciplines
  type SpiritualDiscipline {
    id: String!
    name: String!
    category: String!
    description: String
    typical_duration_minutes: Int
    typical_price_range_min: Float
    typical_price_range_max: Float
    created_at: String
    updated_at: String
  }

  # Enhanced User type with spiritual profile
  type User {
    id: String!
    email: String!
    full_name: String!
    user_type: String!
    avatar_url: String
    is_active: Boolean!
    energy_sensitivity: String
    spiritual_goals: String
    spiritual_experience: String
    privacy_level: String
    created_at: String!
    updated_at: String!
    # Profile image from preferences/practitioner profile
    profile_image_url: String
    # Relationships
    practitioner: Practitioner
    spiritual_preferences: UserSpiritualPreferences
    seeker_preferences: SeekerPreferences
  }

  # Comprehensive Practitioner type
  type Practitioner {
    id: String!
    user_id: String!
    business_name: String
    bio: String
    specialties: [String!]
    years_of_experience: Int
    certifications: [String!]
    consultation_style: String
    energy_sensitivity: String
    languages: [String!]
    timezone: String
    location_city: String
    location_state: String
    location_country: String
    profile_image_url: String
    banner_image_url: String
    website_url: String
    social_media_links: String # JSON string
    verification_status: String!
    verification_documents: [String!]
    verified_at: String
    rating: Float
    total_reviews: Int
    total_sessions: Int
    is_available: Boolean!
    created_at: String!
    updated_at: String!
    # Relationships
    user: User
  }

  # User spiritual preferences (for seekers)
  type UserSpiritualPreferences {
    id: String!
    user_id: String!
    preferred_disciplines: [Int!]
    preferred_consultation_styles: [String!]
    preferred_energy_levels: [String!]
    preferred_session_length: Int
    budget_range_min: Float
    budget_range_max: Float
    preferred_times_of_day: [String!]
    preferred_days_of_week: [String!]
    timezone: String
    location_preference: String
    language_preferences: [String!]
    spiritual_goals: [String!]
    areas_for_growth: [String!]
    previous_experiences: String
    created_at: String!
    updated_at: String!
  }

  # Seeker preferences (simplified mapping)
  type SeekerPreferences {
    id: String!
    user_id: String!
    spiritual_interests: [String!]
    experience_level: String
    profile_image_url: String
    bio: String
    location: String
    created_at: String!
    updated_at: String!
    # Relationships
    user: User
  }

  # Service Offerings by Practitioners
  type ServiceOffering {
    id: String!
    practitioner_id: String!
    spiritual_discipline_id: String!
    title: String!
    description: String!
    price: Float!
    pricing_model: String! # fixed, sliding_scale, donation_based
    duration_minutes: Int!
    is_remote: Boolean!
    is_in_person: Boolean!
    location_details: String
    max_participants: Int
    requirements: String
    preparation_instructions: String
    is_active: Boolean!
    created_at: String!
    updated_at: String!
    # Relationships
    practitioner: Practitioner
    spiritual_discipline: SpiritualDiscipline
  }

  # Booking & Scheduling System Types
  type PractitionerAvailability {
    id: String!
    practitioner_id: String!
    day_of_week: Int!
    start_time: String!
    end_time: String!
    timezone: String!
    is_active: Boolean!
    created_at: String!
    # Relationships
    practitioner: Practitioner
  }

  type PractitionerTimeSlot {
    id: String!
    practitioner_id: String!
    service_offering_id: String
    slot_date: String!
    start_time: String!
    end_time: String!
    timezone: String!
    is_available: Boolean!
    max_bookings: Int!
    current_bookings: Int!
    created_at: String!
    # Relationships
    practitioner: Practitioner
    service_offering: ServiceOffering
  }

  type SpiritualBooking {
    id: String!
    seeker_id: String!
    practitioner_id: String!
    service_offering_id: String!
    time_slot_id: String
    session_date: String!
    session_start_time: String!
    session_end_time: String!
    session_timezone: String!
    booking_status: String!
    session_type: String!
    agreed_price: Float!
    payment_status: String!
    meeting_location: String
    meeting_link: String
    seeker_preparation_notes: String
    practitioner_session_notes: String
    booking_source: String
    created_at: String!
    updated_at: String!
    # Relationships
    seeker: User
    practitioner: Practitioner
    service_offering: ServiceOffering
    time_slot: PractitionerTimeSlot
  }

  type SpiritualReview {
    id: String!
    booking_id: String!
    reviewer_id: String!
    practitioner_id: String!
    overall_rating: Int!
    accuracy_rating: Int
    clarity_rating: Int
    connection_rating: Int
    value_rating: Int
    review_title: String
    review_content: String
    is_anonymous: Boolean!
    is_public: Boolean!
    is_featured: Boolean!
    practitioner_response: String
    practitioner_responded_at: String
    created_at: String!
    # Relationships
    booking: SpiritualBooking
    reviewer: User
    practitioner: Practitioner
  }

  # Authentication types
  type AuthPayload {
    token: String!
    user: User!
    expires_in: String!
  }

  # Input types for user registration
  input UserRegistrationInput {
    email: String!
    password: String!
    full_name: String!
    user_type: String! # 'seeker' or 'practitioner'
    avatar_url: String
    energy_sensitivity: String
    spiritual_goals: String
    spiritual_experience: String
  }

  # Input for practitioner profile setup
  input PractitionerProfileInput {
    business_name: String
    bio: String
    specialties: [String!]
    years_of_experience: Int
    certifications: [String!]
    consultation_style: String
    energy_sensitivity: String
    languages: [String!]
    timezone: String
    location_city: String
    location_state: String
    location_country: String
    profile_image_url: String
    banner_image_url: String
    website_url: String
    social_media_links: String
  }

  # Input for seeker preferences
  input SeekerPreferencesInput {
    preferred_disciplines: [Int!]
    preferred_consultation_styles: [String!]
    preferred_energy_levels: [String!]
    preferred_session_length: Int
    budget_range_min: Float
    budget_range_max: Float
    preferred_times_of_day: [String!]
    preferred_days_of_week: [String!]
    timezone: String
    location_preference: String
    language_preferences: [String!]
    spiritual_goals: [String!]
    areas_for_growth: [String!]
    previous_experiences: String
  }

  # Input for user profile updates
  input UserUpdateInput {
    full_name: String
    avatar_url: String
    energy_sensitivity: String
    spiritual_goals: String
    spiritual_experience: String
    privacy_level: String
  }

  # Input for creating service offerings
  input ServiceOfferingInput {
    spiritual_discipline_id: String!
    title: String!
    description: String!
    price: Float!
    pricing_model: String! # fixed, sliding_scale, donation_based
    duration_minutes: Int!
    is_remote: Boolean!
    is_in_person: Boolean!
    location_details: String
    max_participants: Int
    requirements: String
    preparation_instructions: String
  }

  # Input for service filtering
  input ServiceFilterInput {
    spiritual_discipline_ids: [String!]
    practitioner_ids: [String!]
    price_min: Float
    price_max: Float
    duration_min: Int
    duration_max: Int
    is_remote: Boolean
    is_in_person: Boolean
    search_text: String
  }

  # Booking system input types
  input PractitionerAvailabilityInput {
    day_of_week: Int!
    start_time: String!
    end_time: String!
    timezone: String
    is_active: Boolean
  }

  input TimeSlotInput {
    service_offering_id: String
    slot_date: String!
    start_time: String!
    end_time: String!
    timezone: String
    max_bookings: Int
  }

  input BookingInput {
    service_offering_id: String!
    time_slot_id: String
    session_date: String!
    session_start_time: String!
    session_end_time: String!
    session_timezone: String
    session_type: String!
    meeting_location: String
    seeker_preparation_notes: String
  }

  input BookingFilterInput {
    seeker_id: String
    practitioner_id: String
    booking_status: String
    session_type: String
    date_from: String
    date_to: String
  }

  input ReviewInput {
    booking_id: String!
    overall_rating: Int!
    accuracy_rating: Int
    clarity_rating: Int
    connection_rating: Int
    value_rating: Int
    review_title: String
    review_content: String
    is_anonymous: Boolean
    is_public: Boolean
  }

  type Query {
    # Spiritual disciplines
    spiritual_disciplines(limit: Int = 10, offset: Int = 0): [SpiritualDiscipline!]!
    spiritual_discipline(id: String!): SpiritualDiscipline
    
    # User queries
    users(limit: Int = 10, offset: Int = 0): [User!]!
    user(id: String!): User
    me: User # Get current authenticated user
    
    # Practitioner queries
    practitioners(limit: Int = 10, offset: Int = 0): [Practitioner!]!
    practitioner(id: String!): Practitioner
    practitioner_by_user(user_id: String!): Practitioner
    
    # Seeker preferences
    user_preferences(user_id: String!): UserSpiritualPreferences
    
    # Service marketplace queries
    service_offerings(filter: ServiceFilterInput, limit: Int = 20, offset: Int = 0): [ServiceOffering!]!
    service_offering(id: String!): ServiceOffering
    practitioner_services(practitioner_id: String!): [ServiceOffering!]!
    services_by_discipline(discipline_id: String!): [ServiceOffering!]!
    
    # Booking & scheduling queries
    practitioner_availability(practitioner_id: String!): [PractitionerAvailability!]!
    practitioner_time_slots(practitioner_id: String!, date_from: String, date_to: String): [PractitionerTimeSlot!]!
    available_time_slots(practitioner_id: String!, service_offering_id: String, date_from: String!, date_to: String!): [PractitionerTimeSlot!]!
    spiritual_bookings(filter: BookingFilterInput, limit: Int = 20, offset: Int = 0): [SpiritualBooking!]!
    spiritual_booking(id: String!): SpiritualBooking
    my_bookings(as_seeker: Boolean = true): [SpiritualBooking!]!
    spiritual_reviews(practitioner_id: String, limit: Int = 20, offset: Int = 0): [SpiritualReview!]!
    
    # Payment-related queries
    stripe_connect_account(practitioner_id: String!): StripeConnectAccount
    payment_intent(id: String!): PaymentIntent
    payment_transaction(id: String!): PaymentTransaction
    my_payment_transactions(as_practitioner: Boolean = false): [PaymentTransaction!]!
    booking_payment_status(booking_id: String!): PaymentIntent
    
    # Social/Community queries
    community_posts(limit: Int = 20, offset: Int = 0): [CommunityPost!]!
    community_post(id: String!): CommunityPost
    user_posts(user_id: String!, limit: Int = 20, offset: Int = 0): [CommunityPost!]!
    community_comments(post_id: String!, limit: Int = 20, offset: Int = 0): [CommunityComment!]!
    my_conversations: [Conversation!]!
    conversation(id: String!): Conversation
    conversation_messages(conversation_id: String!, limit: Int = 50, offset: Int = 0): [Message!]!
  }

  type Mutation {
    # Authentication
    register(input: UserRegistrationInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    
    # User profile management
    update_user_profile(input: UserUpdateInput!): User!
    
    # Practitioner profile management
    create_practitioner_profile(input: PractitionerProfileInput!): Practitioner!
    update_practitioner_profile(id: String!, input: PractitionerProfileInput!): Practitioner!
    
    # Seeker preferences management
    create_seeker_preferences(input: SeekerPreferencesInput!): UserSpiritualPreferences!
    update_seeker_preferences(id: String!, input: SeekerPreferencesInput!): UserSpiritualPreferences!
    
    # Account management
    deactivate_account: Boolean!
    reactivate_account: Boolean!
    
    # Service marketplace mutations
    create_service_offering(input: ServiceOfferingInput!): ServiceOffering!
    update_service_offering(id: String!, input: ServiceOfferingInput!): ServiceOffering!
    delete_service_offering(id: String!): Boolean!
    toggle_service_status(id: String!): ServiceOffering!
    
    # Booking & scheduling mutations
    create_availability_pattern(input: PractitionerAvailabilityInput!): PractitionerAvailability!
    update_availability_pattern(id: String!, input: PractitionerAvailabilityInput!): PractitionerAvailability!
    delete_availability_pattern(id: String!): Boolean!
    create_time_slot(input: TimeSlotInput!): PractitionerTimeSlot!
    update_time_slot(id: String!, input: TimeSlotInput!): PractitionerTimeSlot!
    delete_time_slot(id: String!): Boolean!
    create_booking(input: BookingInput!): SpiritualBooking!
    update_booking_status(id: String!, status: String!): SpiritualBooking!
    cancel_booking(id: String!, reason: String): SpiritualBooking!
    complete_booking(id: String!, session_notes: String, session_summary: String): SpiritualBooking!
    create_review(input: ReviewInput!): SpiritualReview!
    update_review(id: String!, input: ReviewInput!): SpiritualReview!
    
    # Stripe Connect & Payment Processing
    create_stripe_connect_account(input: StripeConnectOnboardingInput!): StripeConnectAccount!
    refresh_stripe_onboarding_link(practitioner_id: String!): StripeConnectAccount!
    create_payment_intent(input: PaymentIntentInput!): PaymentIntent!
    confirm_payment_intent(payment_intent_id: String!, payment_method_id: String!): PaymentIntent!
    request_refund(input: RefundInput!): PaymentRefund!
    update_payment_status(booking_id: String!, status: String!): SpiritualBooking!
    
    # Social/Community mutations
    create_community_post(input: CommunityPostInput!): CommunityPost!
    update_community_post(id: String!, input: CommunityPostInput!): CommunityPost!
    delete_community_post(id: String!): Boolean!
    create_community_comment(input: CommunityCommentInput!): CommunityComment!
    update_community_comment(id: String!, content: String!): CommunityComment!
    delete_community_comment(id: String!): Boolean!
    toggle_post_engagement(post_id: String!, engagement_type: String!): CommunityEngagement
    toggle_comment_engagement(comment_id: String!, engagement_type: String!): CommunityEngagement
    send_message(input: MessageInput!): Message!
    mark_message_read(message_id: String!): Message!
    mark_conversation_read(conversation_id: String!): Boolean!
  }

  # Stripe Connect Account for Practitioners
  type StripeConnectAccount {
    id: String!
    practitioner_id: String!
    stripe_account_id: String!
    account_type: String!
    account_status: String!
    onboarding_completed: Boolean!
    onboarding_url: String
    payouts_enabled: Boolean!
    charges_enabled: Boolean!
    details_submitted: Boolean!
    country: String
    default_currency: String
    business_name: String
    business_type: String
    created_at: String!
    updated_at: String!
    # Relationships
    practitioner: Practitioner
  }

  # Payment Intent for Booking Payments
  type PaymentIntent {
    id: String!
    booking_id: String!
    stripe_payment_intent_id: String!
    amount: Int! # Amount in cents
    currency: String!
    platform_fee: Int! # Platform fee in cents
    practitioner_amount: Int! # Amount practitioner receives
    payment_status: String!
    client_secret: String!
    payment_method_id: String
    receipt_email: String
    description: String
    created_at: String!
    updated_at: String!
    # Relationships
    booking: SpiritualBooking
  }

  # Payment Transaction Record
  type PaymentTransaction {
    id: String!
    payment_intent_id: String!
    booking_id: String!
    practitioner_id: String!
    seeker_id: String!
    stripe_charge_id: String
    stripe_transfer_id: String
    total_amount: Int!
    platform_fee: Int!
    practitioner_amount: Int!
    processing_fee: Int
    transaction_status: String!
    charged_at: String
    transferred_at: String
    currency: String!
    description: String
    created_at: String!
    # Relationships
    payment_intent: PaymentIntent
    booking: SpiritualBooking
    practitioner: Practitioner
    seeker: User
  }

  # Payment Refund Record
  type PaymentRefund {
    id: String!
    payment_transaction_id: String!
    booking_id: String!
    stripe_refund_id: String!
    refund_amount: Int!
    platform_fee_refund: Int
    practitioner_refund: Int
    refund_reason: String
    refund_status: String!
    initiated_by: String!
    initiator_id: String
    reason_description: String
    processed_at: String
    created_at: String!
    # Relationships
    payment_transaction: PaymentTransaction
    booking: SpiritualBooking
  }

  # Input types for payment operations
  input StripeConnectOnboardingInput {
    practitioner_id: String!
    account_type: String = "express"
    country: String = "US"
    refresh_url: String!
    return_url: String!
  }

  input PaymentIntentInput {
    booking_id: String!
    payment_method_id: String
    receipt_email: String
    save_payment_method: Boolean = false
  }

  input RefundInput {
    payment_transaction_id: String!
    refund_amount: Int # If not provided, full refund
    reason: String!
    reason_description: String
  }

  # Social/Community Features Types
  type CommunityPost {
    id: String!
    author_id: String!
    title: String
    content: String!
    post_type: String
    spiritual_category: String
    energy_level: String
    media_urls: [String!]
    visibility: String
    is_anonymous: Boolean
    allows_comments: Boolean
    comment_count: Int
    like_count: Int
    share_count: Int
    is_featured: Boolean
    created_at: String!
    updated_at: String!
    # Relationships
    author: User
    comments: [CommunityComment!]
    engagements: [CommunityEngagement!]
    user_engagement: CommunityEngagement # Current user's engagement
  }

  type CommunityComment {
    id: String!
    post_id: String!
    author_id: String!
    parent_comment_id: String
    content: String!
    is_anonymous: Boolean
    like_count: Int
    created_at: String!
    updated_at: String!
    # Relationships
    author: User
    post: CommunityPost
    parent_comment: CommunityComment
    replies: [CommunityComment!]
    user_engagement: CommunityEngagement # Current user's engagement
  }

  type CommunityEngagement {
    id: String!
    user_id: String!
    post_id: String
    comment_id: String
    engagement_type: String!
    created_at: String!
    # Relationships
    user: User
    post: CommunityPost
    comment: CommunityComment
  }

  type Message {
    id: String!
    conversation_id: String!
    sender_id: String!
    content: String!
    message_type: String
    attachment_url: String
    is_read: Boolean
    read_at: String
    created_at: String!
    # Relationships
    sender: User
    conversation: Conversation
  }

  type Conversation {
    id: String!
    participant_1_id: String!
    participant_2_id: String!
    last_message_at: String
    created_at: String!
    updated_at: String!
    # Relationships
    participant_1: User
    participant_2: User
    messages: [Message!]
    last_message: Message
  }

  # Input types for social features
  input CommunityPostInput {
    title: String
    content: String!
    post_type: String
    spiritual_category: String
    energy_level: String
    media_urls: [String!]
    visibility: String
    is_anonymous: Boolean
    allows_comments: Boolean
  }

  input CommunityCommentInput {
    post_id: String!
    parent_comment_id: String
    content: String!
    is_anonymous: Boolean
  }

  input MessageInput {
    conversation_id: String
    recipient_id: String # If no conversation_id, create new conversation
    content: String!
    message_type: String
    attachment_url: String
  }
`;

// GraphQL Resolvers
const resolvers = {
  Query: {
    // Spiritual disciplines queries
    spiritual_disciplines: async (parent, { limit, offset }) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.spiritual_disciplines ORDER BY name LIMIT $1 OFFSET $2',
          [limit, offset]
        );
        return result.rows;
      } finally {
        client.release();
      }
    },
    
    spiritual_discipline: async (parent, { id }) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.spiritual_disciplines WHERE id = $1',
          [id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },
    
    // User queries
    users: async (parent, { limit, offset }) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
          [limit, offset]
        );
        return result.rows;
      } finally {
        client.release();
      }
    },
    
    user: async (parent, { id }) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.users WHERE id = $1',
          [id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },
    
    me: async (parent, args, context) => {
      const authUser = getAuthenticatedUser(context);
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.users WHERE id = $1',
          [authUser.userId]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },
    
    // Practitioner queries
    practitioners: async (parent, { limit, offset }) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.practitioners ORDER BY created_at DESC LIMIT $1 OFFSET $2',
          [limit, offset]
        );
        return result.rows;
      } finally {
        client.release();
      }
    },
    
    practitioner: async (parent, { id }) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.practitioners WHERE id = $1',
          [id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },
    
    practitioner_by_user: async (parent, { user_id }) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.practitioners WHERE user_id = $1',
          [user_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },
    
    // User preferences queries
    user_preferences: async (parent, { user_id }) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.user_spiritual_preferences WHERE user_id = $1',
          [user_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },

    // Service marketplace queries
    service_offerings: async (parent, { filter = {}, limit, offset }) => {
      const client = await pool.connect();
      try {
        let query = `
          SELECT so.*, p.business_name, sd.name as discipline_name, sd.category
          FROM twelthhaus.service_offerings so
          JOIN twelthhaus.practitioners p ON so.practitioner_id::text = p.id::text
          JOIN twelthhaus.spiritual_disciplines sd ON so.spiritual_discipline_id = sd.id
          WHERE so.is_active = true
        `;
        const params = [];
        let paramCount = 0;

        // Apply filters
        if (filter.spiritual_discipline_ids && filter.spiritual_discipline_ids.length > 0) {
          paramCount++;
          query += ` AND so.spiritual_discipline_id = ANY($${paramCount})`;
          params.push(filter.spiritual_discipline_ids);
        }

        if (filter.practitioner_ids && filter.practitioner_ids.length > 0) {
          paramCount++;
          query += ` AND so.practitioner_id = ANY($${paramCount})`;
          params.push(filter.practitioner_ids);
        }

        if (filter.price_min !== undefined) {
          paramCount++;
          query += ` AND so.price >= $${paramCount}`;
          params.push(filter.price_min);
        }

        if (filter.price_max !== undefined) {
          paramCount++;
          query += ` AND so.price <= $${paramCount}`;
          params.push(filter.price_max);
        }

        if (filter.duration_min !== undefined) {
          paramCount++;
          query += ` AND so.duration_minutes >= $${paramCount}`;
          params.push(filter.duration_min);
        }

        if (filter.duration_max !== undefined) {
          paramCount++;
          query += ` AND so.duration_minutes <= $${paramCount}`;
          params.push(filter.duration_max);
        }

        if (filter.is_remote !== undefined) {
          paramCount++;
          query += ` AND so.is_remote = $${paramCount}`;
          params.push(filter.is_remote);
        }

        if (filter.is_in_person !== undefined) {
          paramCount++;
          query += ` AND so.is_in_person = $${paramCount}`;
          params.push(filter.is_in_person);
        }

        if (filter.search_text) {
          paramCount++;
          query += ` AND (so.title ILIKE $${paramCount} OR so.description ILIKE $${paramCount} OR p.business_name ILIKE $${paramCount})`;
          params.push(`%${filter.search_text}%`);
        }

        query += ` ORDER BY so.created_at DESC`;
        
        if (limit) {
          paramCount++;
          query += ` LIMIT $${paramCount}`;
          params.push(limit);
        }
        
        if (offset) {
          paramCount++;
          query += ` OFFSET $${paramCount}`;
          params.push(offset);
        }

        const result = await client.query(query, params);
        return result.rows;
      } finally {
        client.release();
      }
    },

    service_offering: async (parent, { id }) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.service_offerings WHERE id = $1',
          [id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },

    practitioner_services: async (parent, { practitioner_id }) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.service_offerings WHERE practitioner_id = $1 ORDER BY created_at DESC',
          [practitioner_id]
        );
        return result.rows;
      } finally {
        client.release();
      }
    },

    services_by_discipline: async (parent, { discipline_id }) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.service_offerings WHERE spiritual_discipline_id = $1 AND is_active = true ORDER BY created_at DESC',
          [discipline_id]
        );
        return result.rows;
      } finally {
        client.release();
      }
    },

    // Booking & scheduling queries
    practitioner_availability: async (parent, { practitioner_id }) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.practitioner_availability WHERE practitioner_id = $1 AND is_active = true ORDER BY day_of_week, start_time',
          [practitioner_id]
        );
        return result.rows;
      } finally {
        client.release();
      }
    },

    practitioner_time_slots: async (parent, { practitioner_id, date_from, date_to }) => {
      const client = await pool.connect();
      try {
        let query = 'SELECT * FROM twelthhaus.practitioner_time_slots WHERE practitioner_id = $1';
        const params = [practitioner_id];
        let paramCount = 1;

        if (date_from) {
          paramCount++;
          query += ` AND slot_date >= $${paramCount}`;
          params.push(date_from);
        }

        if (date_to) {
          paramCount++;
          query += ` AND slot_date <= $${paramCount}`;
          params.push(date_to);
        }

        query += ' ORDER BY slot_date, start_time';

        const result = await client.query(query, params);
        return result.rows;
      } finally {
        client.release();
      }
    },

    available_time_slots: async (parent, { practitioner_id, service_offering_id, date_from, date_to }) => {
      const client = await pool.connect();
      try {
        let query = `
          SELECT * FROM twelthhaus.practitioner_time_slots 
          WHERE practitioner_id = $1 
          AND is_available = true 
          AND current_bookings < max_bookings
          AND slot_date >= $2 
          AND slot_date <= $3
        `;
        const params = [practitioner_id, date_from, date_to];

        if (service_offering_id) {
          query += ' AND (service_offering_id IS NULL OR service_offering_id = $4)';
          params.push(service_offering_id);
        }

        query += ' ORDER BY slot_date, start_time';

        const result = await client.query(query, params);
        return result.rows;
      } finally {
        client.release();
      }
    },

    spiritual_bookings: async (parent, { filter = {}, limit, offset }) => {
      const client = await pool.connect();
      try {
        let query = 'SELECT * FROM twelthhaus.spiritual_bookings WHERE 1=1';
        const params = [];
        let paramCount = 0;

        if (filter.seeker_id) {
          paramCount++;
          query += ` AND seeker_id = $${paramCount}`;
          params.push(filter.seeker_id);
        }

        if (filter.practitioner_id) {
          paramCount++;
          query += ` AND practitioner_id = $${paramCount}`;
          params.push(filter.practitioner_id);
        }

        if (filter.booking_status) {
          paramCount++;
          query += ` AND booking_status = $${paramCount}`;
          params.push(filter.booking_status);
        }

        if (filter.session_type) {
          paramCount++;
          query += ` AND session_type = $${paramCount}`;
          params.push(filter.session_type);
        }

        if (filter.date_from) {
          paramCount++;
          query += ` AND session_date >= $${paramCount}`;
          params.push(filter.date_from);
        }

        if (filter.date_to) {
          paramCount++;
          query += ` AND session_date <= $${paramCount}`;
          params.push(filter.date_to);
        }

        query += ' ORDER BY session_date DESC, session_start_time DESC';

        if (limit) {
          paramCount++;
          query += ` LIMIT $${paramCount}`;
          params.push(limit);
        }

        if (offset) {
          paramCount++;
          query += ` OFFSET $${paramCount}`;
          params.push(offset);
        }

        const result = await client.query(query, params);
        return result.rows;
      } finally {
        client.release();
      }
    },

    spiritual_booking: async (parent, { id }) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.spiritual_bookings WHERE id = $1',
          [id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },

    my_bookings: async (parent, { as_seeker }, context) => {
      const authUser = getAuthenticatedUser(context);
      const client = await pool.connect();
      try {
        const column = as_seeker ? 'seeker_id' : 'practitioner_id';
        const result = await client.query(
          `SELECT * FROM twelthhaus.spiritual_bookings WHERE ${column} = $1 ORDER BY session_date DESC, session_start_time DESC`,
          [authUser.userId]
        );
        return result.rows;
      } finally {
        client.release();
      }
    },

    spiritual_reviews: async (parent, { practitioner_id, limit, offset }) => {
      const client = await pool.connect();
      try {
        let query = 'SELECT * FROM twelthhaus.spiritual_reviews WHERE is_public = true';
        const params = [];
        let paramCount = 0;

        if (practitioner_id) {
          paramCount++;
          query += ` AND practitioner_id = $${paramCount}`;
          params.push(practitioner_id);
        }

        query += ' ORDER BY created_at DESC';

        if (limit) {
          paramCount++;
          query += ` LIMIT $${paramCount}`;
          params.push(limit);
        }

        if (offset) {
          paramCount++;
          query += ` OFFSET $${paramCount}`;
          params.push(offset);
        }

        const result = await client.query(query, params);
        return result.rows;
      } finally {
        client.release();
      }
    }
  },

  Mutation: {
    // Authentication mutations
    register: async (parent, { input }) => {
      const { email, password, full_name, user_type, avatar_url, energy_sensitivity, spiritual_goals, spiritual_experience } = input;
      
      // Validation
      if (!validateEmail(email)) {
        throw new Error('Invalid email format');
      }
      if (!validateUserType(user_type)) {
        throw new Error('Invalid user type. Must be "seeker" or "practitioner"');
      }
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        // Check if email already exists
        const existingUser = await client.query(
          'SELECT id FROM twelthhaus.users WHERE email = $1',
          [email]
        );
        
        if (existingUser.rows.length > 0) {
          throw new Error('Email already registered');
        }
        
        // Hash password
        const hashedPassword = await hashPassword(password);
        
        // Create user
        const userResult = await client.query(
          `INSERT INTO twelthhaus.users 
           (email, password_hash, full_name, user_type, avatar_url, energy_sensitivity, spiritual_goals, spiritual_experience) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
           RETURNING *`,
          [email, hashedPassword, full_name, user_type, avatar_url, energy_sensitivity, spiritual_goals, spiritual_experience]
        );
        
        const user = userResult.rows[0];
        
        // If practitioner, create basic practitioner profile
        if (user_type === 'practitioner') {
          await client.query(
            `INSERT INTO twelthhaus.practitioners (user_id) VALUES ($1)`,
            [user.id]
          );
        }
        
        await client.query('COMMIT');
        
        // Generate token
        const token = generateToken(user);
        
        return {
          token,
          user,
          expires_in: '24h'
        };
        
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    
    login: async (parent, { email, password }) => {
      if (!validateEmail(email)) {
        throw new Error('Invalid email format');
      }
      
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.users WHERE email = $1 AND is_active = true',
          [email]
        );
        
        if (result.rows.length === 0) {
          throw new Error('Invalid email or password');
        }
        
        const user = result.rows[0];
        const validPassword = await comparePassword(password, user.password_hash);
        
        if (!validPassword) {
          throw new Error('Invalid email or password');
        }
        
        const token = generateToken(user);
        
        return {
          token,
          user,
          expires_in: '24h'
        };
        
      } finally {
        client.release();
      }
    },
    
    // User profile mutations
    update_user_profile: async (parent, { input }, context) => {
      const authUser = getAuthenticatedUser(context);
      const client = await pool.connect();
      
      try {
        const updateFields = [];
        const values = [];
        let paramIndex = 1;
        
        // Build dynamic update query
        Object.entries(input).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            updateFields.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
          }
        });
        
        if (updateFields.length === 0) {
          throw new Error('No fields to update');
        }
        
        values.push(authUser.userId);
        
        const result = await client.query(
          `UPDATE twelthhaus.users 
           SET ${updateFields.join(', ')}, updated_at = NOW() 
           WHERE id = $${paramIndex} 
           RETURNING *`,
          values
        );
        
        return result.rows[0];
        
      } finally {
        client.release();
      }
    },
    
    // Practitioner profile mutations
    create_practitioner_profile: async (parent, { input }, context) => {
      const authUser = getAuthenticatedUser(context);
      
      // Verify user is a practitioner
      if (authUser.userType !== 'practitioner') {
        throw new Error('Only practitioners can create practitioner profiles');
      }
      
      const client = await pool.connect();
      try {
        const result = await client.query(
          `UPDATE twelthhaus.practitioners 
           SET business_name = $1, bio = $2, specialties = $3, years_of_experience = $4, 
               certifications = $5, consultation_style = $6, energy_sensitivity = $7, 
               languages = $8, timezone = $9, location_city = $10, location_state = $11, 
               location_country = $12, profile_image_url = $13, banner_image_url = $14, 
               website_url = $15, social_media_links = $16, updated_at = NOW()
           WHERE user_id = $17 
           RETURNING *`,
          [
            input.business_name, input.bio, input.specialties, input.years_of_experience,
            input.certifications, input.consultation_style, input.energy_sensitivity,
            input.languages, input.timezone, input.location_city, input.location_state,
            input.location_country, input.profile_image_url, input.banner_image_url,
            input.website_url, input.social_media_links, authUser.userId
          ]
        );
        
        return result.rows[0];
        
      } finally {
        client.release();
      }
    },
    
    update_practitioner_profile: async (parent, { id, input }, context) => {
      const authUser = getAuthenticatedUser(context);
      const client = await pool.connect();
      
      try {
        // Verify ownership
        const ownershipCheck = await client.query(
          'SELECT user_id FROM twelthhaus.practitioners WHERE id = $1',
          [id]
        );
        
        if (ownershipCheck.rows.length === 0) {
          throw new Error('Practitioner profile not found');
        }
        
        if (ownershipCheck.rows[0].user_id !== authUser.userId) {
          throw new Error('Unauthorized to update this profile');
        }
        
        const updateFields = [];
        const values = [];
        let paramIndex = 1;
        
        Object.entries(input).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            updateFields.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
          }
        });
        
        if (updateFields.length === 0) {
          throw new Error('No fields to update');
        }
        
        values.push(id);
        
        const result = await client.query(
          `UPDATE twelthhaus.practitioners 
           SET ${updateFields.join(', ')}, updated_at = NOW() 
           WHERE id = $${paramIndex} 
           RETURNING *`,
          values
        );
        
        return result.rows[0];
        
      } finally {
        client.release();
      }
    },
    
    // Seeker preferences mutations
    create_seeker_preferences: async (parent, { input }, context) => {
      const authUser = getAuthenticatedUser(context);
      const client = await pool.connect();
      
      try {
        const result = await client.query(
          `INSERT INTO twelthhaus.user_spiritual_preferences 
           (user_id, preferred_disciplines, preferred_consultation_styles, preferred_energy_levels,
            preferred_session_length, budget_range_min, budget_range_max, preferred_times_of_day,
            preferred_days_of_week, timezone, location_preference, language_preferences,
            spiritual_goals, areas_for_growth, previous_experiences)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           RETURNING *`,
          [
            authUser.userId, input.preferred_disciplines, input.preferred_consultation_styles,
            input.preferred_energy_levels, input.preferred_session_length, input.budget_range_min,
            input.budget_range_max, input.preferred_times_of_day, input.preferred_days_of_week,
            input.timezone, input.location_preference, input.language_preferences,
            input.spiritual_goals, input.areas_for_growth, input.previous_experiences
          ]
        );
        
        return result.rows[0];
        
      } finally {
        client.release();
      }
    },
    
    update_seeker_preferences: async (parent, { id, input }, context) => {
      const authUser = getAuthenticatedUser(context);
      const client = await pool.connect();
      
      try {
        // Verify ownership
        const ownershipCheck = await client.query(
          'SELECT user_id FROM twelthhaus.user_spiritual_preferences WHERE id = $1',
          [id]
        );
        
        if (ownershipCheck.rows.length === 0) {
          throw new Error('Preferences not found');
        }
        
        if (ownershipCheck.rows[0].user_id !== authUser.userId) {
          throw new Error('Unauthorized to update these preferences');
        }
        
        const updateFields = [];
        const values = [];
        let paramIndex = 1;
        
        Object.entries(input).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            updateFields.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
          }
        });
        
        if (updateFields.length === 0) {
          throw new Error('No fields to update');
        }
        
        values.push(id);
        
        const result = await client.query(
          `UPDATE twelthhaus.user_spiritual_preferences 
           SET ${updateFields.join(', ')}, updated_at = NOW() 
           WHERE id = $${paramIndex} 
           RETURNING *`,
          values
        );
        
        return result.rows[0];
        
      } finally {
        client.release();
      }
    },
    
    // Account management
    deactivate_account: async (parent, args, context) => {
      const authUser = getAuthenticatedUser(context);
      const client = await pool.connect();
      
      try {
        await client.query(
          'UPDATE twelthhaus.users SET is_active = false, updated_at = NOW() WHERE id = $1',
          [authUser.userId]
        );
        
        return true;
        
      } finally {
        client.release();
      }
    },
    
    reactivate_account: async (parent, args, context) => {
      const authUser = getAuthenticatedUser(context);
      const client = await pool.connect();
      
      try {
        await client.query(
          'UPDATE twelthhaus.users SET is_active = true, updated_at = NOW() WHERE id = $1',
          [authUser.userId]
        );
        
        return true;
        
      } finally {
        client.release();
      }
    },

    // Service marketplace mutations
    create_service_offering: async (parent, { input }, context) => {
      const authUser = getAuthenticatedUser(context);
      
      // Verify user is a practitioner
      if (authUser.userType !== 'practitioner') {
        throw new Error('Only practitioners can create service offerings');
      }
      
      const client = await pool.connect();
      try {
        // Get practitioner ID
        const practitionerResult = await client.query(
          'SELECT id FROM twelthhaus.practitioners WHERE user_id = $1',
          [authUser.userId]
        );
        
        if (practitionerResult.rows.length === 0) {
          throw new Error('Practitioner profile not found');
        }
        
        const practitionerId = practitionerResult.rows[0].id;
        
        // Create service offering
        const result = await client.query(
          `INSERT INTO twelthhaus.service_offerings 
           (practitioner_id, spiritual_discipline_id, title, description, price, pricing_model, 
            duration_minutes, is_remote, is_in_person, location_details, max_participants, 
            requirements, preparation_instructions) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
           RETURNING *`,
          [
            practitionerId,
            input.spiritual_discipline_id,
            input.title,
            input.description,
            input.price,
            input.pricing_model,
            input.duration_minutes,
            input.is_remote,
            input.is_in_person,
            input.location_details,
            input.max_participants,
            input.requirements,
            input.preparation_instructions
          ]
        );
        
        return result.rows[0];
      } finally {
        client.release();
      }
    },

    update_service_offering: async (parent, { id, input }, context) => {
      const authUser = getAuthenticatedUser(context);
      
      const client = await pool.connect();
      try {
        // Verify ownership - user must own this service offering
        const ownershipCheck = await client.query(
          `SELECT so.id FROM twelthhaus.service_offerings so
           JOIN twelthhaus.practitioners p ON so.practitioner_id::text = p.id::text
           WHERE so.id = $1 AND p.user_id = $2`,
          [id, authUser.userId]
        );
        
        if (ownershipCheck.rows.length === 0) {
          throw new Error('Service offering not found or you do not have permission to update it');
        }
        
        // Update service offering
        const result = await client.query(
          `UPDATE twelthhaus.service_offerings 
           SET spiritual_discipline_id = $2, title = $3, description = $4, price = $5, 
               pricing_model = $6, duration_minutes = $7, is_remote = $8, is_in_person = $9, 
               location_details = $10, max_participants = $11, requirements = $12, 
               preparation_instructions = $13, updated_at = NOW()
           WHERE id = $1 
           RETURNING *`,
          [
            id,
            input.spiritual_discipline_id,
            input.title,
            input.description,
            input.price,
            input.pricing_model,
            input.duration_minutes,
            input.is_remote,
            input.is_in_person,
            input.location_details,
            input.max_participants,
            input.requirements,
            input.preparation_instructions
          ]
        );
        
        return result.rows[0];
      } finally {
        client.release();
      }
    },

    delete_service_offering: async (parent, { id }, context) => {
      const authUser = getAuthenticatedUser(context);
      
      const client = await pool.connect();
      try {
        // Verify ownership
        const ownershipCheck = await client.query(
          `SELECT so.id FROM twelthhaus.service_offerings so
           JOIN twelthhaus.practitioners p ON so.practitioner_id::text = p.id::text
           WHERE so.id = $1 AND p.user_id = $2`,
          [id, authUser.userId]
        );
        
        if (ownershipCheck.rows.length === 0) {
          throw new Error('Service offering not found or you do not have permission to delete it');
        }
        
        // Delete service offering
        await client.query(
          'DELETE FROM twelthhaus.service_offerings WHERE id = $1',
          [id]
        );
        
        return true;
      } finally {
        client.release();
      }
    },

    toggle_service_status: async (parent, { id }, context) => {
      const authUser = getAuthenticatedUser(context);
      
      const client = await pool.connect();
      try {
        // Verify ownership and get current status
        const serviceCheck = await client.query(
          `SELECT so.id, so.is_active FROM twelthhaus.service_offerings so
           JOIN twelthhaus.practitioners p ON so.practitioner_id::text = p.id::text
           WHERE so.id = $1 AND p.user_id = $2`,
          [id, authUser.userId]
        );
        
        if (serviceCheck.rows.length === 0) {
          throw new Error('Service offering not found or you do not have permission to modify it');
        }
        
        const currentStatus = serviceCheck.rows[0].is_active;
        
        // Toggle status
        const result = await client.query(
          'UPDATE twelthhaus.service_offerings SET is_active = $2, updated_at = NOW() WHERE id = $1 RETURNING *',
          [id, !currentStatus]
        );
        
        return result.rows[0];
      } finally {
        client.release();
      }
    },

    // Booking & scheduling mutations
    create_booking: async (parent, { input }, context) => {
      const authUser = getAuthenticatedUser(context);
      
      // Verify user is a seeker
      if (authUser.userType !== 'seeker') {
        throw new Error('Only seekers can create bookings');
      }
      
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        // Get service offering details and practitioner
        const serviceResult = await client.query(
          'SELECT so.*, p.id as practitioner_id FROM twelthhaus.service_offerings so JOIN twelthhaus.practitioners p ON so.practitioner_id::text = p.id::text WHERE so.id = $1 AND so.is_active = true',
          [input.service_offering_id]
        );
        
        if (serviceResult.rows.length === 0) {
          throw new Error('Service offering not found or not available');
        }
        
        const service = serviceResult.rows[0];
        
        // Create the booking
        const bookingResult = await client.query(
          `INSERT INTO twelthhaus.spiritual_bookings 
           (seeker_id, practitioner_id, service_offering_id, time_slot_id, session_date, session_start_time, session_end_time, session_timezone, session_type, agreed_price, seeker_preparation_notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING *`,
          [
            authUser.userId,
            service.practitioner_id,
            input.service_offering_id,
            input.time_slot_id,
            input.session_date,
            input.session_start_time,
            input.session_end_time,
            input.session_timezone || 'America/New_York',
            input.session_type,
            service.price,
            input.seeker_preparation_notes
          ]
        );
        
        // Update time slot if specified
        if (input.time_slot_id) {
          await client.query(
            'UPDATE twelthhaus.practitioner_time_slots SET current_bookings = current_bookings + 1 WHERE id = $1',
            [input.time_slot_id]
          );
        }
        
        await client.query('COMMIT');
        return bookingResult.rows[0];
        
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },

    create_time_slot: async (parent, { input }, context) => {
      const authUser = getAuthenticatedUser(context);
      
      // Verify user is a practitioner
      if (authUser.userType !== 'practitioner') {
        throw new Error('Only practitioners can create time slots');
      }
      
      const client = await pool.connect();
      try {
        // Get practitioner ID
        const practitionerResult = await client.query(
          'SELECT id FROM twelthhaus.practitioners WHERE user_id = $1',
          [authUser.userId]
        );
        
        if (practitionerResult.rows.length === 0) {
          throw new Error('Practitioner profile not found');
        }
        
        const practitionerId = practitionerResult.rows[0].id;
        
        // Create time slot
        const result = await client.query(
          `INSERT INTO twelthhaus.practitioner_time_slots 
           (practitioner_id, service_offering_id, slot_date, start_time, end_time, timezone, max_bookings)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [
            practitionerId,
            input.service_offering_id,
            input.slot_date,
            input.start_time,
            input.end_time,
            input.timezone || 'America/New_York',
            input.max_bookings || 1
          ]
        );
        
        return result.rows[0];
      } finally {
        client.release();
      }
    }
  },
  
  // Relationship resolvers
  User: {
    practitioner: async (parent) => {
      if (parent.user_type !== 'practitioner') return null;
      
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.practitioners WHERE user_id = $1',
          [parent.id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },
    
    spiritual_preferences: async (parent) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.user_spiritual_preferences WHERE user_id = $1',
          [parent.id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },

    seeker_preferences: async (parent) => {
      if (parent.user_type !== 'seeker') return null;
      
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.seeker_preferences WHERE user_id = $1',
          [parent.id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },

    profile_image_url: async (parent) => {
      const client = await pool.connect();
      try {
        if (parent.user_type === 'practitioner') {
          const result = await client.query(
            'SELECT profile_image_url FROM twelthhaus.practitioners WHERE user_id = $1',
            [parent.id]
          );
          return result.rows[0]?.profile_image_url || parent.avatar_url;
        } else {
          const result = await client.query(
            'SELECT profile_image_url FROM twelthhaus.seeker_preferences WHERE user_id = $1',
            [parent.id]
          );
          return result.rows[0]?.profile_image_url || parent.avatar_url;
        }
      } finally {
        client.release();
      }
    }
  },
  
  Practitioner: {
    user: async (parent) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.users WHERE id = $1',
          [parent.user_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    }
  },

  SeekerPreferences: {
    user: async (parent) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.users WHERE id = $1',
          [parent.user_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    }
  },

  ServiceOffering: {
    practitioner: async (parent) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.practitioners WHERE id = $1',
          [parent.practitioner_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },
    
    spiritual_discipline: async (parent) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.spiritual_disciplines WHERE id = $1',
          [parent.spiritual_discipline_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    }
  }
};

// Add payment resolvers to existing resolvers object
resolvers.Query = {
  ...resolvers.Query,
  
  // Get Stripe Connect account for practitioner
  stripe_connect_account: async (parent, { practitioner_id }, context) => {
      const authUser = getAuthenticatedUser(context);
      const client = await pool.connect();
      
      try {
        // Verify practitioner owns this account or is admin
        const practitionerCheck = await client.query(
          'SELECT user_id FROM twelthhaus.practitioners WHERE id = $1',
          [practitioner_id]
        );
        
        if (!practitionerCheck.rows[0] || 
            (practitionerCheck.rows[0].user_id !== authUser.userId && authUser.userType !== 'admin')) {
          throw new Error('Unauthorized to view this Connect account');
        }
        
        const result = await client.query(
          'SELECT * FROM twelthhaus.stripe_connect_accounts WHERE practitioner_id = $1',
          [practitioner_id]
        );
        
        return result.rows[0];
      } finally {
        client.release();
      }
    },

    // Get payment intent details
    payment_intent: async (parent, { id }, context) => {
      const authUser = getAuthenticatedUser(context);
      const client = await pool.connect();
      
      try {
        const result = await client.query(`
          SELECT pi.*, sb.seeker_id, sb.practitioner_id 
          FROM twelthhaus.payment_intents pi
          JOIN twelthhaus.spiritual_bookings sb ON pi.booking_id = sb.id
          WHERE pi.id = $1
        `, [id]);
        
        if (!result.rows[0]) {
          throw new Error('Payment intent not found');
        }
        
        const paymentIntent = result.rows[0];
        
        // Verify user has access to this payment intent
        if (paymentIntent.seeker_id !== authUser.userId && 
            paymentIntent.practitioner_id !== authUser.userId &&
            authUser.userType !== 'admin') {
          throw new Error('Unauthorized to view this payment intent');
        }
        
        return paymentIntent;
      } finally {
        client.release();
      }
    },

    // Get user's payment transactions
    my_payment_transactions: async (parent, { as_practitioner }, context) => {
      const authUser = getAuthenticatedUser(context);
      const client = await pool.connect();
      
      try {
        const userColumn = as_practitioner ? 'practitioner_id' : 'seeker_id';
        const result = await client.query(`
          SELECT * FROM twelthhaus.payment_transactions 
          WHERE ${userColumn} = $1 
          ORDER BY created_at DESC
        `, [authUser.userId]);
        
        return result.rows;
      } finally {
        client.release();
      }
    },

    // Get payment status for a booking
    booking_payment_status: async (parent, { booking_id }, context) => {
      const authUser = getAuthenticatedUser(context);
      const client = await pool.connect();
      
      try {
        // Verify user has access to this booking
        const bookingCheck = await client.query(
          'SELECT seeker_id, practitioner_id FROM twelthhaus.spiritual_bookings WHERE id = $1',
          [booking_id]
        );
        
        if (!bookingCheck.rows[0] || 
            (bookingCheck.rows[0].seeker_id !== authUser.userId && 
             bookingCheck.rows[0].practitioner_id !== authUser.userId)) {
          throw new Error('Unauthorized to view this booking payment status');
        }
        
        const result = await client.query(
          'SELECT * FROM twelthhaus.payment_intents WHERE booking_id = $1 ORDER BY created_at DESC LIMIT 1',
          [booking_id]
        );
        
        return result.rows[0];
      } finally {
        client.release();
      }
    }
};

resolvers.Mutation = {
  ...resolvers.Mutation,
    
    // Create Stripe Connect account and onboarding link
    create_stripe_connect_account: async (parent, { input }, context) => {
      const authUser = getAuthenticatedUser(context);
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Verify user is the practitioner or admin
        const practitionerCheck = await client.query(
          'SELECT user_id FROM twelthhaus.practitioners WHERE id = $1',
          [input.practitioner_id]
        );
        
        if (!practitionerCheck.rows[0] || 
            (practitionerCheck.rows[0].user_id !== authUser.userId && authUser.userType !== 'admin')) {
          throw new Error('Unauthorized to create Connect account for this practitioner');
        }
        
        // Check if account already exists
        const existingAccount = await client.query(
          'SELECT * FROM twelthhaus.stripe_connect_accounts WHERE practitioner_id = $1',
          [input.practitioner_id]
        );
        
        if (existingAccount.rows[0]) {
          throw new Error('Stripe Connect account already exists for this practitioner');
        }
        
        // Create Stripe Connect Express account
        const account = await stripe.accounts.create({
          type: input.account_type,
          country: input.country,
          capabilities: {
            transfers: { requested: true },
            card_payments: { requested: true }
          }
        });
        
        // Create onboarding link
        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: input.refresh_url,
          return_url: input.return_url,
          type: 'account_onboarding'
        });
        
        // Store account info in database
        const result = await client.query(`
          INSERT INTO twelthhaus.stripe_connect_accounts 
          (practitioner_id, stripe_account_id, account_type, account_status, 
           onboarding_completed, onboarding_url, payouts_enabled, charges_enabled, 
           details_submitted, country, default_currency)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `, [
          input.practitioner_id,
          account.id,
          account.type,
          'pending',
          false,
          accountLink.url,
          false,
          false,
          false,
          input.country,
          'USD'
        ]);
        
        await client.query('COMMIT');
        return result.rows[0];
        
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating Stripe Connect account:', error);
        throw new Error('Failed to create Stripe Connect account: ' + error.message);
      } finally {
        client.release();
      }
    },

    // Create payment intent for booking
    create_payment_intent: async (parent, { input }, context) => {
      const authUser = getAuthenticatedUser(context);
      
      if (authUser.userType !== 'seeker') {
        throw new Error('Only seekers can create payment intents');
      }
      
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Get booking details
        const bookingResult = await client.query(`
          SELECT sb.*, p.id as practitioner_id, sca.stripe_account_id
          FROM twelthhaus.spiritual_bookings sb
          JOIN twelthhaus.practitioners p ON sb.practitioner_id = p.id::text
          LEFT JOIN twelthhaus.stripe_connect_accounts sca ON p.id = sca.practitioner_id
          WHERE sb.id = $1 AND sb.seeker_id = $2
        `, [input.booking_id, authUser.userId]);
        
        if (!bookingResult.rows[0]) {
          throw new Error('Booking not found or unauthorized');
        }
        
        const booking = bookingResult.rows[0];
        
        if (!booking.stripe_account_id) {
          throw new Error('Practitioner has not completed Stripe Connect setup');
        }
        
        // Calculate amounts
        const totalAmount = Math.round(booking.agreed_price * 100); // Convert to cents
        const platformFeePercentage = 5.0; // 5% platform fee
        const platformFee = Math.round(totalAmount * (platformFeePercentage / 100));
        const practitionerAmount = totalAmount - platformFee;
        
        // Create Stripe PaymentIntent with application fee
        const paymentIntent = await stripe.paymentIntents.create({
          amount: totalAmount,
          currency: 'usd',
          application_fee_amount: platformFee,
          transfer_data: {
            destination: booking.stripe_account_id
          },
          metadata: {
            booking_id: input.booking_id,
            practitioner_id: booking.practitioner_id,
            seeker_id: authUser.userId
          },
          receipt_email: input.receipt_email,
          description: `12thhaus Spiritual Session - $${booking.agreed_price}`
        });
        
        // Store payment intent in database
        const result = await client.query(`
          INSERT INTO twelthhaus.payment_intents 
          (booking_id, stripe_payment_intent_id, amount, currency, 
           platform_fee, practitioner_amount, payment_status, client_secret,
           payment_method_id, receipt_email, description)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `, [
          input.booking_id,
          paymentIntent.id,
          totalAmount,
          'USD',
          platformFee,
          practitionerAmount,
          paymentIntent.status,
          paymentIntent.client_secret,
          input.payment_method_id,
          input.receipt_email,
          paymentIntent.description
        ]);
        
        await client.query('COMMIT');
        return result.rows[0];
        
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating payment intent:', error);
        throw new Error('Failed to create payment intent: ' + error.message);
      } finally {
        client.release();
      }
    }
};

// Add relationship resolvers for payment types
resolvers.StripeConnectAccount = {
    practitioner: async (parent) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.practitioners WHERE id = $1',
          [parent.practitioner_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    }
};

resolvers.PaymentIntent = {
    booking: async (parent) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.spiritual_bookings WHERE id = $1',
          [parent.booking_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    }
};

resolvers.PaymentTransaction = {
    payment_intent: async (parent) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.payment_intents WHERE id = $1',
          [parent.payment_intent_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },
    
    booking: async (parent) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.spiritual_bookings WHERE id = $1',
          [parent.booking_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },
    
    practitioner: async (parent) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.practitioners WHERE id = $1',
          [parent.practitioner_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },
    
    seeker: async (parent) => {
      const client = await pool.connect();
      try {  
        const result = await client.query(
          'SELECT * FROM twelthhaus.users WHERE id = $1',
          [parent.seeker_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    }
};

// Add social feature resolvers
resolvers.Query = {
  ...resolvers.Query,
  
  // Community posts queries
  community_posts: async (parent, { limit, offset }) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM twelthhaus.community_posts WHERE visibility = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        ['public', limit, offset]
      );
      return result.rows;
    } finally {
      client.release();
    }
  },
  
  community_post: async (parent, { id }) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM twelthhaus.community_posts WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },
  
  user_posts: async (parent, { user_id, limit, offset }) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM twelthhaus.community_posts WHERE author_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [user_id, limit, offset]
      );
      return result.rows;
    } finally {
      client.release();
    }
  },
  
  community_comments: async (parent, { post_id, limit, offset }) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM twelthhaus.community_comments WHERE post_id = $1 ORDER BY created_at ASC LIMIT $2 OFFSET $3',
        [post_id, limit, offset]
      );
      return result.rows;
    } finally {
      client.release();
    }
  },
  
  my_conversations: async (parent, args, context) => {
    const authUser = getAuthenticatedUser(context);
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM twelthhaus.conversations WHERE participant_1_id = $1 OR participant_2_id = $1 ORDER BY last_message_at DESC',
        [authUser.userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  },
  
  conversation: async (parent, { id }, context) => {
    const authUser = getAuthenticatedUser(context);
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM twelthhaus.conversations WHERE id = $1 AND (participant_1_id = $2 OR participant_2_id = $2)',
        [id, authUser.userId]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },
  
  conversation_messages: async (parent, { conversation_id, limit, offset }, context) => {
    const authUser = getAuthenticatedUser(context);
    const client = await pool.connect();
    try {
      // Verify user has access to this conversation
      const conversationCheck = await client.query(
        'SELECT id FROM twelthhaus.conversations WHERE id = $1 AND (participant_1_id = $2 OR participant_2_id = $2)',
        [conversation_id, authUser.userId]
      );
      
      if (conversationCheck.rows.length === 0) {
        throw new Error('Unauthorized to access this conversation');
      }
      
      const result = await client.query(
        'SELECT * FROM twelthhaus.messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [conversation_id, limit, offset]
      );
      return result.rows.reverse(); // Show oldest first
    } finally {
      client.release();
    }
  }
};

resolvers.Mutation = {
  ...resolvers.Mutation,
  
  // Community post mutations
  create_community_post: async (parent, { input }, context) => {
    const authUser = getAuthenticatedUser(context);
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `INSERT INTO twelthhaus.community_posts 
         (author_id, title, content, post_type, spiritual_category, energy_level, media_urls, visibility, is_anonymous, allows_comments)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          authUser.userId,
          input.title,
          input.content,
          input.post_type || 'general',
          input.spiritual_category,
          input.energy_level || 'neutral',
          input.media_urls || [],
          input.visibility || 'public',
          input.is_anonymous || false,
          input.allows_comments !== false
        ]
      );
      
      return result.rows[0];
    } finally {
      client.release();
    }
  },
  
  create_community_comment: async (parent, { input }, context) => {
    const authUser = getAuthenticatedUser(context);
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create comment
      const commentResult = await client.query(
        `INSERT INTO twelthhaus.community_comments 
         (post_id, author_id, parent_comment_id, content, is_anonymous)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          input.post_id,
          authUser.userId,
          input.parent_comment_id,
          input.content,
          input.is_anonymous || false
        ]
      );
      
      // Update post comment count
      await client.query(
        'UPDATE twelthhaus.community_posts SET comment_count = comment_count + 1 WHERE id = $1',
        [input.post_id]
      );
      
      await client.query('COMMIT');
      return commentResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
  
  toggle_post_engagement: async (parent, { post_id, engagement_type }, context) => {
    const authUser = getAuthenticatedUser(context);
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if engagement already exists
      const existingResult = await client.query(
        'SELECT id FROM twelthhaus.community_engagements WHERE user_id = $1 AND post_id = $2 AND engagement_type = $3',
        [authUser.userId, post_id, engagement_type]
      );
      
      let result;
      let countChange = 0;
      
      if (existingResult.rows.length > 0) {
        // Remove engagement
        await client.query(
          'DELETE FROM twelthhaus.community_engagements WHERE id = $1',
          [existingResult.rows[0].id]
        );
        countChange = -1;
        result = null;
      } else {
        // Add engagement
        const engagementResult = await client.query(
          'INSERT INTO twelthhaus.community_engagements (user_id, post_id, engagement_type) VALUES ($1, $2, $3) RETURNING *',
          [authUser.userId, post_id, engagement_type]
        );
        countChange = 1;
        result = engagementResult.rows[0];
      }
      
      // Update post counts
      const countField = `${engagement_type}_count`;
      await client.query(
        `UPDATE twelthhaus.community_posts SET ${countField} = ${countField} + $1 WHERE id = $2`,
        [countChange, post_id]
      );
      
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
  
  send_message: async (parent, { input }, context) => {
    const authUser = getAuthenticatedUser(context);
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      let conversationId = input.conversation_id;
      
      // If no conversation_id provided, create new conversation
      if (!conversationId && input.recipient_id) {
        // Check if conversation already exists
        const existingConversation = await client.query(
          `SELECT id FROM twelthhaus.conversations 
           WHERE (participant_1_id = $1 AND participant_2_id = $2) 
           OR (participant_1_id = $2 AND participant_2_id = $1)`,
          [authUser.userId, input.recipient_id]
        );
        
        if (existingConversation.rows.length > 0) {
          conversationId = existingConversation.rows[0].id;
        } else {
          // Create new conversation
          const newConversation = await client.query(
            'INSERT INTO twelthhaus.conversations (participant_1_id, participant_2_id) VALUES ($1, $2) RETURNING id',
            [authUser.userId, input.recipient_id]
          );
          conversationId = newConversation.rows[0].id;
        }
      }
      
      // Create message
      const messageResult = await client.query(
        `INSERT INTO twelthhaus.messages 
         (conversation_id, sender_id, content, message_type, attachment_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          conversationId,
          authUser.userId,
          input.content,
          input.message_type || 'text',
          input.attachment_url
        ]
      );
      
      // Update conversation last_message_at
      await client.query(
        'UPDATE twelthhaus.conversations SET last_message_at = NOW(), last_message_preview = $1 WHERE id = $2',
        [input.content.substring(0, 100), conversationId]
      );
      
      await client.query('COMMIT');
      return messageResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

// Add relationship resolvers for social features
resolvers.CommunityPost = {
  author: async (parent) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM twelthhaus.users WHERE id = $1',
        [parent.author_id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },
  
  comments: async (parent) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM twelthhaus.community_comments WHERE post_id = $1 ORDER BY created_at ASC',
        [parent.id]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }
};

resolvers.CommunityComment = {
  author: async (parent) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM twelthhaus.users WHERE id = $1',
        [parent.author_id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },
  
  post: async (parent) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM twelthhaus.community_posts WHERE id = $1',
        [parent.post_id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }
};

// Add Message resolvers
resolvers.Message = {
    sender: async (parent) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.users WHERE id = $1',
          [parent.sender_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },
    
    conversation: async (parent) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.conversations WHERE id = $1',
          [parent.conversation_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    }
};

// Add Conversation resolvers  
resolvers.Conversation = {
    participant_1: async (parent) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.users WHERE id = $1',
          [parent.participant_1_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },
    
    participant_2: async (parent) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.users WHERE id = $1',
          [parent.participant_2_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },
    
    messages: async (parent) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.messages WHERE conversation_id = $1 ORDER BY created_at ASC',
          [parent.id]
        );
        return result.rows;
      } finally {
        client.release();
      }
    }
};

async function startServer() {
  const app = express();
  
  // Enable CORS
  app.use(cors());
  
  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true,
    context: ({ req }) => ({
      req,
      // Add any additional context here
      // User will be extracted from token in resolvers that need it
    })
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  const PORT = process.env.PORT || 4000;
  
  app.listen(PORT, () => {
    console.log(`🚀 12thhaus GraphQL Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`📊 GraphQL Playground: http://localhost:${PORT}${server.graphqlPath}`);
  });
}

// Test database connection on startup
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT COUNT(*) FROM twelthhaus.spiritual_disciplines');
    console.log(`✅ Database connected: ${result.rows[0].count} spiritual disciplines found`);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Start the server
testConnection().then(connected => {
  if (connected) {
    startServer();
  } else {
    console.error('❌ Server startup failed due to database connection issues');
    process.exit(1);
  }
});
