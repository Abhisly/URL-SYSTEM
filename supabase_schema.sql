-- URL SYSTEM Database Schema

-- 1. URL Scans Table
CREATE TABLE IF NOT EXISTS public.url_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    status TEXT NOT NULL, -- 'SAFE', 'SUSPICIOUS', 'MALICIOUS'
    confidence INTEGER NOT NULL,
    risk_level TEXT NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    threat_score INTEGER NOT NULL,
    reasons JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Email Scans Table
CREATE TABLE IF NOT EXISTS public.email_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    status TEXT NOT NULL, -- 'GENUINE', 'SUSPICIOUS', 'SPOOFED'
    confidence INTEGER NOT NULL,
    risk_level TEXT NOT NULL,
    reasons JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Image Scans Table
CREATE TABLE IF NOT EXISTS public.image_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    ocr_text TEXT,
    status TEXT NOT NULL, -- 'SAFE', 'SUSPICIOUS', 'MALICIOUS'
    confidence INTEGER NOT NULL,
    risk_level TEXT NOT NULL,
    reasons JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Threat Reports Table
CREATE TABLE IF NOT EXISTS public.threat_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_type TEXT NOT NULL, -- 'URL', 'EMAIL', 'IMAGE'
    scan_id UUID NOT NULL,
    report_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) setup (optional but recommended)
-- Enable RLS for all tables
ALTER TABLE public.url_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_reports ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts and selects for this MVP phase
CREATE POLICY "Allow anonymous select on url_scans" ON public.url_scans FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on url_scans" ON public.url_scans FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous select on email_scans" ON public.email_scans FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on email_scans" ON public.email_scans FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous select on image_scans" ON public.image_scans FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on image_scans" ON public.image_scans FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous select on threat_reports" ON public.threat_reports FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on threat_reports" ON public.threat_reports FOR INSERT WITH CHECK (true);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_url_scans_created_at ON public.url_scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_scans_created_at ON public.email_scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_image_scans_created_at ON public.image_scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threat_reports_scan_id ON public.threat_reports(scan_id);
CREATE INDEX IF NOT EXISTS idx_threat_reports_created_at ON public.threat_reports(created_at DESC);
