-- ================================================
-- DanceFlow 초기 스키마
-- ================================================

-- 1. profiles: Supabase Auth 사용자 확장
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL CHECK (char_length(nickname) >= 2 AND char_length(nickname) <= 20),
  avatar_url TEXT,
  settings JSONB NOT NULL DEFAULT '{"mirrorMode": true, "playbackSpeed": 1}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_nickname ON public.profiles(nickname);

-- 2. choreographies: 안무 정보
CREATE TABLE public.choreographies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration INTEGER NOT NULL CHECK (duration > 0),
  thumbnail_url TEXT,
  audio_url TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_choreographies_difficulty ON public.choreographies(difficulty);
CREATE INDEX idx_choreographies_artist ON public.choreographies(artist);

-- 3. reference_poses: 레퍼런스(정답지) 포즈 데이터
CREATE TABLE public.reference_poses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  choreography_id UUID NOT NULL REFERENCES public.choreographies(id) ON DELETE CASCADE,
  recorder_id UUID NOT NULL REFERENCES public.profiles(id),
  pose_data_url TEXT NOT NULL,
  frame_count INTEGER NOT NULL CHECK (frame_count > 0),
  duration_ms INTEGER NOT NULL CHECK (duration_ms > 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('processing', 'active', 'archived')),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reference_poses_choreography ON public.reference_poses(choreography_id);
CREATE INDEX idx_reference_poses_active ON public.reference_poses(choreography_id, status) WHERE status = 'active';
CREATE UNIQUE INDEX idx_reference_poses_primary ON public.reference_poses(choreography_id) WHERE is_primary = true;

-- 4. practice_sessions: 연습 기록
CREATE TABLE public.practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  choreography_id UUID NOT NULL REFERENCES public.choreographies(id),
  reference_id UUID REFERENCES public.reference_poses(id),
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  grade TEXT NOT NULL CHECK (grade IN ('perfect', 'great', 'good', 'ok', 'miss')),
  accuracy_score INTEGER CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
  timing_score INTEGER CHECK (timing_score >= 0 AND timing_score <= 100),
  body_part_scores JSONB NOT NULL DEFAULT '[]'::jsonb,
  pose_data_url TEXT,
  frame_count INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_practice_sessions_user ON public.practice_sessions(user_id, created_at DESC);
CREATE INDEX idx_practice_sessions_choreography ON public.practice_sessions(choreography_id);
CREATE INDEX idx_practice_sessions_score ON public.practice_sessions(choreography_id, total_score DESC);
CREATE INDEX idx_practice_sessions_user_choreo ON public.practice_sessions(user_id, choreography_id, total_score DESC);

-- ================================================
-- RLS 정책
-- ================================================

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- choreographies
ALTER TABLE public.choreographies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "choreographies_select_all" ON public.choreographies
  FOR SELECT USING (true);

CREATE POLICY "choreographies_insert_authenticated" ON public.choreographies
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- reference_poses
ALTER TABLE public.reference_poses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reference_poses_select_active" ON public.reference_poses
  FOR SELECT USING (status = 'active');

CREATE POLICY "reference_poses_insert_own" ON public.reference_poses
  FOR INSERT WITH CHECK (auth.uid() = recorder_id);

CREATE POLICY "reference_poses_update_own" ON public.reference_poses
  FOR UPDATE USING (auth.uid() = recorder_id);

-- practice_sessions
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "practice_sessions_select_all" ON public.practice_sessions
  FOR SELECT USING (true);

CREATE POLICY "practice_sessions_insert_own" ON public.practice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================================================
-- 자동 프로필 생성 트리거
-- ================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nickname', '댄서' || substr(NEW.id::text, 1, 4)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- Seed 데이터: 기존 6곡 안무
-- ================================================
INSERT INTO public.choreographies (id, title, artist, difficulty, duration) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Super Shy', 'NewJeans', 'beginner', 30),
  ('a1b2c3d4-0001-4000-8000-000000000002', 'ELEVEN', 'IVE', 'beginner', 30),
  ('a1b2c3d4-0001-4000-8000-000000000003', 'SET ME FREE', 'TWICE', 'beginner', 35),
  ('a1b2c3d4-0001-4000-8000-000000000004', 'Next Level', 'aespa', 'intermediate', 45),
  ('a1b2c3d4-0001-4000-8000-000000000005', 'ANTIFRAGILE', 'LE SSERAFIM', 'intermediate', 40),
  ('a1b2c3d4-0001-4000-8000-000000000006', 'Pink Venom', 'BLACKPINK', 'advanced', 50);

-- ================================================
-- Storage 버킷 (Supabase Dashboard에서 수동 생성 필요)
-- 버킷명: danceflow-poses (private)
-- ================================================
