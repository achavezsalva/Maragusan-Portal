-- Supabase SQL Schema for Maragusan LGU Portal

-- 1. Users Table
CREATE TABLE users (
  uid UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'citizen',
  department_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Departments Table
CREATE TABLE departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  head TEXT NOT NULL,
  description TEXT,
  contact JSONB DEFAULT '{}'::jsonb,
  services TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Announcements Table
CREATE TABLE announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  department_id TEXT REFERENCES departments(id),
  author_id UUID REFERENCES users(uid),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Feedback Table
CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(uid),
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Service Requests Table
CREATE TABLE service_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(uid),
  service_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS POLICIES (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = uid);
CREATE POLICY "Admins can view all profiles" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE uid = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = uid);

-- Departments policies
CREATE POLICY "Public can view departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Admins can manage departments" ON departments FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE uid = auth.uid() AND role = 'admin')
);

-- Announcements policies
CREATE POLICY "Public can view announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Staff can manage announcements" ON announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE uid = auth.uid() AND (role = 'staff' OR role = 'admin'))
);

-- Feedback policies
CREATE POLICY "Citizens can view/create their own feedback" ON feedback FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view/manage all feedback" ON feedback FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE uid = auth.uid() AND role = 'admin')
);

-- Service Requests policies
CREATE POLICY "Citizens can view/create their own requests" ON service_requests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Staff/Admins can view all requests" ON service_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE uid = auth.uid() AND (role = 'staff' OR role = 'admin'))
);
