# Docker and User Management Fix Guide

## Overview
This guide provides solutions for:
1. Docker configuration issues
2. User management admin panel not fetching data from database

## Quick Fix Steps

### 1. Database Migration
First, run the database migration script to ensure all tables and policies are properly configured:

```sql
-- Connect to your Supabase database and run:
-- File: scripts/fix-user-management-complete.sql
```

Go to your Supabase dashboard:
1. Navigate to SQL Editor
2. Create a new query
3. Copy and paste the content from `scripts/fix-user-management-complete.sql`
4. Execute the query

### 2. Environment Variables Check
Ensure your `.env.local` file has all required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # CRITICAL for admin panel
NEXT_PUBLIC_SITE_URL=your_site_url
```

**Important**: The `SUPABASE_SERVICE_ROLE_KEY` is essential for the admin panel to bypass Row Level Security (RLS) and fetch all users.

### 3. Docker Setup

#### For Development with Docker:

```bash
# Build the development image
docker-compose -f docker-compose.yml build web-dev

# Start the development container
docker-compose -f docker-compose.yml up web-dev

# Access the application at http://localhost:3001
```

#### For Production with Docker:

```bash
# Build the production image
docker-compose -f docker-compose.yml build web

# Start the production container
docker-compose -f docker-compose.yml up web

# Access the application at http://localhost:3000
```

#### Without Docker (Local Development):

```bash
# Install dependencies
npm install
# or
pnpm install

# Run development server
npm run dev
# or
pnpm dev

# Access at http://localhost:3000
```

### 4. Test the User Management Panel

1. Navigate to `/admin` in your application
2. Sign in with an admin account
3. Go to the User Management section
4. If you see no users, check:
   - Is `SUPABASE_SERVICE_ROLE_KEY` set correctly?
   - Have you run the database migration script?
   - Are there actually users in your database?

### 5. Create an Admin User

To make yourself an admin, run this SQL in Supabase:

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

## Troubleshooting

### Docker Issues

#### Container won't start:
```bash
# Check logs
docker-compose logs web-dev

# Clean and rebuild
docker-compose down
docker system prune -f
docker-compose build --no-cache web-dev
docker-compose up web-dev
```

#### Port already in use:
```bash
# Change the port in docker-compose.yml
# For example, change "3001:3000" to "3002:3000"
```

### User Management Issues

#### No users showing:
1. Check browser console for errors
2. Check network tab for API response
3. Verify in Supabase dashboard that profiles table has data
4. Check if RLS policies are correctly set

#### Can't update user roles:
1. Ensure you're logged in as an admin
2. Check that the service role key is correctly configured
3. Verify RLS policies allow admin updates

#### API returns 500 error:
1. Check server logs: `docker-compose logs web-dev`
2. Verify all environment variables are set
3. Check if database connection is working

### Testing Scripts

Run the Docker test script:
```bash
# Make it executable
chmod +x scripts/docker/docker-test.sh

# Run the test
./scripts/docker/docker-test.sh
```

## Database Schema Overview

The user management system uses these tables:
- `profiles`: User information (id, email, full_name, role, is_active, etc.)
- `activity_logs`: User activity tracking

### RLS Policies
- Users can read their own profile
- Admins can read all profiles
- Service role can bypass all RLS
- Users can update their own profile (limited fields)
- Admins can update all profiles

## Performance Optimizations

1. **API Caching**: Responses are cached for 10 seconds
2. **Pagination**: Default 50 users per page
3. **Indexes**: Created on role, is_active, and created_at columns
4. **Fallback**: Direct Supabase queries if API fails

## Security Considerations

1. **Service Role Key**: Never expose this in client-side code
2. **Admin Check**: Uses secure function to verify admin status
3. **RLS**: Row Level Security prevents unauthorized access
4. **Activity Logging**: All admin actions are logged

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## Support

If issues persist:
1. Check the debug information shown in the admin panel
2. Review server logs
3. Verify database connection in Supabase dashboard
4. Ensure all migrations have been run successfully
