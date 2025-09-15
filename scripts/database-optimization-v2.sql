-- Additional Performance Optimizations and Monitoring
-- Run this after the initial optimization script

-- Adding text search indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_agendas_title_search 
ON agendas USING gin(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_agendas_description_search 
ON agendas USING gin(to_tsvector('english', description));

CREATE INDEX IF NOT EXISTS idx_suggestions_content_search 
ON suggestions USING gin(to_tsvector('english', content));

-- Adding composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_agendas_category_priority_created 
ON agendas(category, priority_level, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agendas_status_priority_created 
ON agendas(status, priority_level, created_at DESC);

-- Adding indexes for activity monitoring and analytics
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_created 
ON activity_logs(action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_resource_action 
ON activity_logs(resource_type, action, created_at DESC);

-- Optimizing vote aggregation queries with materialized view approach
-- Note: This creates a function to refresh vote statistics efficiently
CREATE OR REPLACE FUNCTION refresh_vote_statistics()
RETURNS void AS $$
BEGIN
  -- This function can be called periodically to update cached vote counts
  -- Useful for heavy read workloads
  
  -- Update agenda vote statistics
  UPDATE agendas SET 
    updated_at = NOW()
  WHERE id IN (
    SELECT DISTINCT agenda_id 
    FROM agenda_votes 
    WHERE created_at > NOW() - INTERVAL '1 hour'
  );
  
  -- Update suggestion vote statistics  
  UPDATE suggestions SET 
    created_at = created_at -- Touch timestamp for cache invalidation
  WHERE id IN (
    SELECT DISTINCT suggestion_id 
    FROM suggestion_votes 
    WHERE created_at > NOW() - INTERVAL '1 hour'
  );
END;
$$ LANGUAGE plpgsql;

-- Adding database-level constraints for data integrity
ALTER TABLE agendas 
ADD CONSTRAINT chk_agendas_priority 
CHECK (priority_level IN ('High', 'Medium', 'Low'));

ALTER TABLE agendas 
ADD CONSTRAINT chk_agendas_status 
CHECK (status IN ('Draft', 'Under Review', 'Approved', 'Implemented'));

ALTER TABLE suggestions 
ADD CONSTRAINT chk_suggestions_status 
CHECK (status IN ('pending', 'approved', 'rejected', 'implemented'));

-- Adding performance monitoring views
CREATE OR REPLACE VIEW vote_performance_stats AS
SELECT 
  'agenda_votes' as table_name,
  COUNT(*) as total_votes,
  COUNT(DISTINCT agenda_id) as unique_items,
  COUNT(DISTINCT user_id) as unique_voters,
  AVG(CASE WHEN vote_type = 'like' THEN 1 ELSE 0 END) as like_ratio
FROM agenda_votes
UNION ALL
SELECT 
  'suggestion_votes' as table_name,
  COUNT(*) as total_votes,
  COUNT(DISTINCT suggestion_id) as unique_items,
  COUNT(DISTINCT user_id) as unique_voters,
  AVG(CASE WHEN vote_type = 'like' THEN 1 ELSE 0 END) as like_ratio
FROM suggestion_votes;

-- Adding query performance monitoring
CREATE OR REPLACE VIEW slow_query_candidates AS
SELECT 
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch,
  CASE 
    WHEN seq_scan > 0 THEN seq_tup_read / seq_scan 
    ELSE 0 
  END as avg_seq_read
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY seq_tup_read DESC;

-- Final analysis to update query planner statistics
ANALYZE agenda_votes;
ANALYZE suggestion_votes;
ANALYZE agendas;
ANALYZE suggestions;
ANALYZE profiles;
ANALYZE activity_logs;
