-- Supabase SQL Schema for Maragusan LGU Portal
-- Run this in the Supabase SQL Editor

-- 0. Clean up existing tables to ensure type consistency (Resetting for clean setup)
DROP TABLE IF EXISTS service_requests CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- 1. Departments Table
CREATE TABLE departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  head TEXT NOT NULL,
  description TEXT,
  contact JSONB DEFAULT '{}'::jsonb,
  services TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Users Table
CREATE TABLE users (
  id TEXT PRIMARY KEY, -- Renamed from uid to id to match default Supabase conventions and avoid reserved word confusion
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'citizen',
  department_id TEXT REFERENCES departments(id),
  is_claimed BOOLEAN DEFAULT false,
  access_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Announcements Table
CREATE TABLE announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  department_id TEXT REFERENCES departments(id),
  author_id TEXT REFERENCES users(id),
  is_municipal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Feedback Table
CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Service Requests Table
CREATE TABLE service_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  service_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS Helper Functions (Security Definer to avoid infinite recursion)
-- These functions run with the privileges of the function creator (postgres),
-- allowing them to check the users table without triggering RLS recursively.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  _role TEXT;
  _email TEXT;
BEGIN
  -- Get email from JWT for master admin fallback
  _email := LOWER(auth.jwt()->>'email');
  IF _email = 'achavezsalva@gmail.com' THEN
    RETURN TRUE;
  END IF;

  -- Check role in users table
  SELECT role INTO _role FROM public.users WHERE id = auth.uid()::text;
  RETURN _role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN AS $$
DECLARE
  _role TEXT;
  _email TEXT;
BEGIN
  -- Get email from JWT for master admin fallback
  _email := LOWER(auth.jwt()->>'email');
  IF _email = 'achavezsalva@gmail.com' THEN
    RETURN TRUE;
  END IF;

  -- Check role in users table
  SELECT role INTO _role FROM public.users WHERE id = auth.uid()::text;
  RETURN _role = 'admin' OR _role = 'staff';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RLS POLICIES (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- 1. Users policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (id = auth.uid()::text);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (id = auth.uid()::text);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (id = auth.uid()::text);

-- Admin overrides for Users
CREATE POLICY "Admins can view all profiles" ON users FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert any profile" ON users FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update any profile" ON users FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete any profile" ON users FOR DELETE USING (public.is_admin());

-- 2. Departments policies
CREATE POLICY "Public can view departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Admins can manage departments" ON departments FOR ALL USING (public.is_admin());

-- 3. Announcements policies
CREATE POLICY "Public can view announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Staff can manage announcements" ON announcements FOR ALL USING (public.is_staff_or_admin());

-- 4. Feedback policies
CREATE POLICY "Citizens can view/create their own feedback" ON feedback FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Admins can view/manage all feedback" ON feedback FOR ALL USING (public.is_admin());

-- 5. Service Requests policies
CREATE POLICY "Citizens can view/create their own requests" ON service_requests FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Staff/Admins can view all requests" ON service_requests FOR SELECT USING (public.is_staff_or_admin());
