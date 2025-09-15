-- Connection Pooling and Performance Optimization Script
-- Addresses connection exhaustion and query performance issues

-- 1. Create connection monitoring view
-- Adding connection monitoring for pgBouncer optimization
CREATE OR REPLACE VIEW public.connection_stats AS
SELECT 
  datname as database_name,
  numbackends as active_connections,
  xact_commit as transactions_committed,
  xact_rollback as transactions_rolled_back,
  blks_read as blocks_read,
  blks_hit as blocks_hit,
  tup_returned as tuples_returned,
  tup_fetched as tuples_fetched,
  tup_inserted as tuples_inserted,
  tup_updated as tuples_updated,
  tup_deleted as tuples_deleted
FROM pg_stat_database 
WHERE datname = current_database();

-- 2. Add performance indexes for vote queries (addressing N+1 problem)
-- Adding composite indexes to eliminate N+1 queries from debug logs
CREATE INDEX IF NOT EXISTS idx_agenda_votes_agenda_user ON public.agenda_votes(agenda_id, user_id);
CREATE INDEX IF NOT EXISTS idx_agenda_votes_counts ON public.agenda_votes(agenda_id, vote_type);
CREATE INDEX IF NOT EXISTS idx_suggestion_votes_suggestion_user ON public.suggestion_votes(suggestion_id, user_id);
CREATE INDEX IF NOT EXISTS idx_suggestion_votes_counts ON public.suggestion_votes(suggestion_id, vote_type);

-- 3. Create materialized view for vote counts (performance optimization)
-- Adding materialized view to cache vote counts and reduce database load
CREATE MATERIALIZED VIEW IF NOT EXISTS public.agenda_vote_counts AS
SELECT 
  agenda_id,
  COUNT(CASE WHEN vote_type = 'like' THEN 1 END) as likes,
  COUNT(CASE WHEN vote_type = 'dislike' THEN 1 END) as dislikes,
  COUNT(*) as total_votes
FROM public.agenda_votes
GROUP BY agenda_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_agenda_vote_counts_agenda_id 
ON public.agenda_vote_counts(agenda_id);

-- 4. Create refresh function for vote counts
-- Adding function to refresh materialized view efficiently
CREATE OR REPLACE FUNCTION public.refresh_vote_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.agenda_vote_counts;
END;
$$;

-- 5. Create trigger to refresh vote counts on changes
-- Adding trigger to keep vote counts synchronized
CREATE OR REPLACE FUNCTION public.refresh_vote_counts_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Refresh the materialized view after vote changes
  PERFORM public.refresh_vote_counts();
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS refresh_agenda_votes ON public.agenda_votes;
CREATE TRIGGER refresh_agenda_votes
  AFTER INSERT OR UPDATE OR DELETE ON public.agenda_votes
  FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_vote_counts_trigger();

-- 6. Add connection limit monitoring function
-- Adding function to monitor connection usage
CREATE OR REPLACE FUNCTION public.check_connection_health()
RETURNS TABLE(
  metric TEXT,
  value NUMERIC,
  status TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'active_connections'::TEXT,
    numbackends::NUMERIC,
    CASE 
      WHEN numbackends > 80 THEN 'CRITICAL'
      WHEN numbackends > 60 THEN 'WARNING'
      ELSE 'OK'
    END::TEXT
  FROM pg_stat_database 
  WHERE datname = current_database()
  
  UNION ALL
  
  SELECT 
    'cache_hit_ratio'::TEXT,
    ROUND(
      (blks_hit::NUMERIC / NULLIF(blks_hit + blks_read, 0)) * 100, 2
    ),
    CASE 
      WHEN (blks_hit::NUMERIC / NULLIF(blks_hit + blks_read, 0)) < 0.9 THEN 'WARNING'
      ELSE 'OK'
    END::TEXT
  FROM pg_stat_database 
  WHERE datname = current_database();
END;
$$;

-- 7. Grant permissions for monitoring
GRANT SELECT ON public.connection_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_connection_health() TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_vote_counts() TO authenticated;
