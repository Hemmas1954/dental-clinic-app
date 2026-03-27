-- =====================
-- CLINIC SETTINGS
-- =====================
CREATE TABLE clinic_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'عيادة الأسنان',
  doctor_name TEXT NOT NULL DEFAULT 'د. محمد أمين',
  phone TEXT,
  address TEXT,
  email TEXT,
  working_hours JSONB DEFAULT '{"start": "08:00", "end": "17:00"}',
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- AI / WEBHOOK CONFIG
-- =====================
CREATE TABLE ai_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_new_patient TEXT,
  webhook_book_appointment TEXT,
  webhook_confirm_appointment TEXT,
  webhook_patient_query TEXT,
  api_key TEXT,
  last_test_status JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- PATIENTS
-- =====================
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_number SERIAL UNIQUE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  blood_type TEXT CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  chronic_diseases TEXT,
  allergies TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- SERVICES
-- =====================
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  category TEXT CHECK (category IN ('تشخيص','علاج','تجميل','جراحة')) DEFAULT 'علاج',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- APPOINTMENTS
-- =====================
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  appointment_date TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('معلق','مؤكد','مكتمل','ملغي')) DEFAULT 'معلق',
  doctor_notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- VISITS
-- =====================
CREATE TABLE visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  service_id UUID REFERENCES services(id),
  visit_date TIMESTAMPTZ DEFAULT NOW(),
  diagnosis TEXT,
  treatment TEXT,
  prescribed_medication TEXT,
  amount_paid DECIMAL(10,2),
  next_appointment_date DATE,
  images_urls TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- ROW LEVEL SECURITY
-- =====================
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_config ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
CREATE POLICY "authenticated_full_access" ON patients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_full_access" ON appointments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_full_access" ON services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_full_access" ON visits FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_full_access" ON clinic_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_full_access" ON ai_config FOR ALL USING (auth.role() = 'authenticated');

-- =====================
-- TRIGGERS: updated_at
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
