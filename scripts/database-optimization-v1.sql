-- Database Schema Optimization for Nepal Reforms Platform
-- This script adds missing indexes and optimizes column types for better performance

-- Adding composite indexes for vote queries to eliminate N+1 problems
CREATE INDEX IF NOT EXISTS idx_agenda_votes_agenda_user 
ON agenda_votes(agenda_id, user_id);

CREATE INDEX IF NOT EXISTS idx_agenda_votes_agenda_type 
ON agenda_votes(agenda_id, vote_type);

CREATE INDEX IF NOT EXISTS idx_suggestion_votes_suggestion_user 
ON suggestion_votes(suggestion_id, user_id);

CREATE INDEX IF NOT EXISTS idx_suggestion_votes_suggestion_type 
ON suggestion_votes(suggestion_id, vote_type);

-- Adding indexes for activity logs performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created 
ON activity_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_resource 
ON activity_logs(resource_type, resource_id);

-- Adding indexes for suggestions filtering and sorting
CREATE INDEX IF NOT EXISTS idx_suggestions_agenda_created 
ON suggestions(agenda_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_suggestions_status_created 
ON suggestions(status, created_at DESC);

-- Adding indexes for agendas filtering
CREATE INDEX IF NOT EXISTS idx_agendas_category_created 
ON agendas(category, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agendas_created_desc 
ON agendas(created_at DESC);

-- Adding indexes for profiles performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_active 
ON profiles(role, is_active);

CREATE INDEX IF NOT EXISTS idx_profiles_email_unique 
ON profiles(email) WHERE email IS NOT NULL;

-- Optimizing column types for better performance
-- Note: These changes require careful migration in production

-- Add constraints for data integrity
ALTER TABLE agenda_votes 
ADD CONSTRAINT chk_agenda_vote_type 
CHECK (vote_type IN ('like', 'dislike'));

ALTER TABLE suggestion_votes 
ADD CONSTRAINT chk_suggestion_vote_type 
CHECK (vote_type IN ('like', 'dislike'));

ALTER TABLE profiles 
ADD CONSTRAINT chk_profile_role 
CHECK (role IN ('admin', 'user', 'moderator'));

-- Adding partial indexes for active users only
CREATE INDEX IF NOT EXISTS idx_profiles_active_users 
ON profiles(id, role) WHERE is_active = true;

-- Adding GIN index for array operations on agendas
CREATE INDEX IF NOT EXISTS idx_agendas_key_points_gin 
ON agendas USING GIN (key_points);

-- Analyze tables for query planner optimization
ANALYZE agenda_votes;
ANALYZE suggestion_votes;
ANALYZE agendas;
ANALYZE suggestions;
ANALYZE profiles;
ANALYZE activity_logs;
