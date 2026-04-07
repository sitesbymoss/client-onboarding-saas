-- SwiftBoard SQL Schema Initialization

-- 1. Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    primary_color TEXT
);

-- 2. Users (Admins linked to Auth)
-- Enforces a 1-to-1 sync with Supabase's native auth.users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT
);

-- 3. Clients (End users going through onboarding)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Templates (Reusable workflow sets)
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Template Tasks (Individual items in a template)
CREATE TABLE template_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g. 'FILE_UPLOAD', 'TEXT_INPUT', 'CHECKBOX'
    order_index INT NOT NULL
);

-- 6. Projects (Actively fired instances of Templates attached to Clients)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending Upload', 
    magic_token TEXT UNIQUE NOT NULL, -- The unique URL hash for the secure portal
    progress INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Project Tasks (Cloned items attached to a specific project)
CREATE TABLE project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    response_data TEXT, -- Can store File storage URLs or text responses
    order_index INT NOT NULL
);

-- ==== AUTH TRIGGER MIGRATIONS ====
-- Automatically creates an Organization and Profile User when someone signs up!
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  user_full_name TEXT;
BEGIN
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  -- 1. Create a baseline organization for the new user
  INSERT INTO public.organizations (name)
  VALUES (user_full_name || '''s Organization')
  RETURNING id INTO new_org_id;

  -- 2. Create the internal users row
  INSERT INTO public.users (id, org_id, email, full_name)
  VALUES (NEW.id, new_org_id, NEW.email, user_full_name);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==== SECURITY ====
-- For Demo/Staging ease, we will allow all authenticated users full operational control.
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all actions for authenticated users" ON organizations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all actions for authenticated users" ON users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all actions for authenticated users" ON clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all actions for authenticated users" ON templates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all actions for authenticated users" ON template_tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all actions for authenticated users" ON projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all actions for authenticated users" ON project_tasks FOR ALL USING (auth.role() = 'authenticated');

-- Portal Bypass (Allows the Magic Token route to fetch specific projects statelessly without authentication)
CREATE POLICY "Allow public read of projects by magic_token" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public read of project_tasks" ON project_tasks FOR SELECT USING (true);
CREATE POLICY "Allow public update of project_tasks" ON project_tasks FOR UPDATE USING (true);
