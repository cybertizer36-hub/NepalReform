-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create agendas table for reform topics
CREATE TABLE IF NOT EXISTS public.agendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  key_points TEXT[] NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on agendas (public read, admin write)
ALTER TABLE public.agendas ENABLE ROW LEVEL SECURITY;

-- Agendas policies - everyone can read, but only authenticated users can interact
CREATE POLICY "agendas_select_all" ON public.agendas FOR SELECT TO PUBLIC USING (true);

-- Create suggestions table for user submissions
CREATE TABLE IF NOT EXISTS public.suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id UUID REFERENCES public.agendas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on suggestions
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- Suggestions policies
CREATE POLICY "suggestions_select_all" ON public.suggestions FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "suggestions_insert_own" ON public.suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "suggestions_update_own" ON public.suggestions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "suggestions_delete_own" ON public.suggestions FOR DELETE USING (auth.uid() = user_id);

-- Create agenda_votes table for likes/dislikes on agendas
CREATE TABLE IF NOT EXISTS public.agenda_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id UUID REFERENCES public.agendas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('like', 'dislike')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agenda_id, user_id)
);

-- Enable RLS on agenda_votes
ALTER TABLE public.agenda_votes ENABLE ROW LEVEL SECURITY;

-- Agenda votes policies
CREATE POLICY "agenda_votes_select_all" ON public.agenda_votes FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "agenda_votes_insert_own" ON public.agenda_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "agenda_votes_update_own" ON public.agenda_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "agenda_votes_delete_own" ON public.agenda_votes FOR DELETE USING (auth.uid() = user_id);

-- Create suggestion_votes table for likes/dislikes on suggestions
CREATE TABLE IF NOT EXISTS public.suggestion_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID REFERENCES public.suggestions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('like', 'dislike')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(suggestion_id, user_id)
);

-- Enable RLS on suggestion_votes
ALTER TABLE public.suggestion_votes ENABLE ROW LEVEL SECURITY;

-- Suggestion votes policies
CREATE POLICY "suggestion_votes_select_all" ON public.suggestion_votes FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "suggestion_votes_insert_own" ON public.suggestion_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "suggestion_votes_update_own" ON public.suggestion_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "suggestion_votes_delete_own" ON public.suggestion_votes FOR DELETE USING (auth.uid() = user_id);
