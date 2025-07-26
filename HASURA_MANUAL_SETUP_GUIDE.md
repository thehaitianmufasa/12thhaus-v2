# 12thhaus v2.0 Hasura Manual Setup Guide

## ⚠️ Network Connectivity Issue Detected

The automated Hasura Cloud configuration is failing due to network connectivity issues between Hasura Cloud and Supabase. This requires manual configuration through the Hasura console.

## 🛠️ Manual Setup Instructions

### Step 1: Access Hasura Console
1. Open the Hasura Console: https://probable-donkey-61.hasura.app/console
2. Use Admin Secret: `3GnFK5l1bySIMsKQ46IAAf2IzSQ7Is1RvlXaGAh4M1vZqLlRKmRPk1w76Mdq0eQq`

### Step 2: Add Database Connection
1. Go to **Data** tab in Hasura Console
2. Click **Connect Database**
3. Use these connection details:

```
Database Name: default
Database URL: postgresql://postgres:Paysoz991@###@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres?sslmode=require
```

**Alternative Connection String (URL-encoded):**
```
postgresql://postgres:Paysoz991%40%23%23%23@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres?sslmode=require
```

### Step 3: Track 12thhaus Tables
Once connected, track these tables from the `twelthhaus` schema:

**Core Tables:**
- ✅ `twelthhaus.users`
- ✅ `twelthhaus.practitioners`
- ✅ `twelthhaus.spiritual_disciplines`
- ✅ `twelthhaus.spiritual_services`
- ✅ `twelthhaus.spiritual_bookings`

**Community Tables:**
- ✅ `twelthhaus.community_posts`
- ✅ `twelthhaus.community_comments`
- ✅ `twelthhaus.community_engagements`

**Communication Tables:**
- ✅ `twelthhaus.conversations`
- ✅ `twelthhaus.messages`

**Additional Tables:**
- ✅ `twelthhaus.spiritual_reviews`
- ✅ `twelthhaus.spiritual_journey_entries`
- ✅ `twelthhaus.payment_transactions`
- ✅ `twelthhaus.notifications`
- ✅ `twelthhaus.user_spiritual_preferences`

### Step 4: Configure Relationships
After tracking tables, set up these key relationships:

1. **practitioners.user** → `users` (object relationship via `user_id`)
2. **spiritual_services.practitioner** → `practitioners` (object relationship via `practitioner_id`)
3. **spiritual_services.spiritual_discipline** → `spiritual_disciplines` (object relationship via `discipline_id`)
4. **spiritual_bookings.spiritual_service** → `spiritual_services` (object relationship via `service_id`)
5. **spiritual_bookings.client** → `users` (object relationship via `client_id`)
6. **community_posts.author** → `users` (object relationship via `author_id`)

### Step 5: Test Sample Queries
Test these GraphQL queries in the GraphiQL explorer:

```graphql
# Query 1: Spiritual Disciplines
query GetSpiritualDisciplines {
  spiritual_disciplines(limit: 5) {
    id
    name
    category
    typical_duration_minutes
    typical_price_range_min
    typical_price_range_max
  }
}

# Query 2: Practitioners with Users
query GetPractitioners {
  practitioners(limit: 3) {
    id
    business_name
    verification_status
    user {
      full_name
      email
    }
  }
}

# Query 3: Services with Relationships
query GetServices {
  spiritual_services(limit: 3) {
    id
    title
    base_price
    practitioner {
      business_name
    }
    spiritual_discipline {
      name
      category
    }
  }
}
```

## 🔧 Alternative: Local Hasura Instance

If Hasura Cloud continues to have connectivity issues, we can set up a local Hasura instance:

```bash
# In 12thhaus-v2 directory
cd hasura-setup
docker-compose up -d hasura

# Access local console at: http://localhost:8080
# Use the same database URL and configuration steps
```

## 📊 Expected Results

After successful configuration:
- **15 tables** tracked from `twelthhaus` schema
- **6+ relationships** configured for complex queries
- **GraphQL API** responding with spiritual platform data
- **Sample queries** returning actual data from deployed database

## 🎯 Next Steps After Setup

1. **Test API Functionality** - Verify all queries work
2. **Configure Permissions** - Set up role-based access
3. **Frontend Integration** - Connect Next.js app to GraphQL API
4. **Authentication Setup** - Integrate Logto with Hasura JWT

## 💡 Troubleshooting

**Database Connection Issues:**
- Ensure SSL mode is required: `?sslmode=require`
- Check if Supabase allows external connections
- Verify database URL encoding is correct

**Table Tracking Issues:**
- Confirm `twelthhaus` schema exists in database
- Check if tables are accessible with current user permissions
- Try tracking tables one by one instead of bulk operation

**Relationship Configuration:**
- Ensure foreign key constraints exist in database
- Use manual relationship configuration if auto-detect fails
- Test relationships with simple queries first

---

**Status**: Manual configuration required due to network connectivity  
**Priority**: High - Required for GraphQL API functionality  
**Estimated Time**: 30-45 minutes via Hasura Console  
**Dependencies**: Supabase database operational (✅ Complete)