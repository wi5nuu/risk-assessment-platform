-- =====================================================
-- Smart User Guide & Tutorial System
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create Tutorials Table
CREATE TABLE IF NOT EXISTS public.tutorials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL, -- path in bucket
    file_type TEXT, -- pdf, docx, mp4
    uploaded_by UUID REFERENCES public.user_profiles(id),
    role_target TEXT DEFAULT 'all' CHECK (role_target IN ('all', 'admin', 'auditor', 'auditee')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for tutorials table
DROP POLICY IF EXISTS "Anyone can view tutorials" ON public.tutorials;
CREATE POLICY "Anyone can view tutorials"
    ON public.tutorials FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage tutorials" ON public.tutorials;
CREATE POLICY "Admins can manage tutorials"
    ON public.tutorials FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 4. Create Storage Bucket for Tutorials
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tutorials', 'tutorials', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage RLS Policies for tutorials bucket
DROP POLICY IF EXISTS "Authenticated users can view tutorials" ON storage.objects;
CREATE POLICY "Authenticated users can view tutorials" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'tutorials' AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Admins can upload tutorials" ON storage.objects;
CREATE POLICY "Admins can upload tutorials" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'tutorials' AND EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete tutorials" ON storage.objects;
CREATE POLICY "Admins can delete tutorials" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'tutorials' AND EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
