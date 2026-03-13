-- Create roles enum
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');

-- Create risk level enum
CREATE TYPE risk_level AS ENUM ('critical', 'high', 'medium', 'low');

-- Create appointment status enum
CREATE TYPE appointment_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- Create medical speciality enum
CREATE TYPE medical_specialty AS ENUM (
  'cardiology',
  'neurology',
  'orthopedics',
  'gastroenterology',
  'dermatology',
  'pulmonology',
  'rheumatology',
  'endocrinology',
  'general_medicine'
);

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'patient',
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Patient profiles table
CREATE TABLE IF NOT EXISTS public.patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  date_of_birth DATE,
  gender TEXT,
  blood_type TEXT,
  allergies TEXT[] DEFAULT '{}',
  medical_history TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own profile" ON public.patient_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients can update their own profile" ON public.patient_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Doctors can view assigned patient profiles" ON public.patient_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.patient_id = patient_profiles.user_id
      AND appointments.doctor_id = auth.uid()
    )
  );

-- Patient biometrics table
CREATE TABLE IF NOT EXISTS public.patient_biometrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  height_cm DECIMAL(5, 2),
  weight_kg DECIMAL(5, 2),
  blood_pressure_systolic INT,
  blood_pressure_diastolic INT,
  heart_rate INT,
  temperature_celsius DECIMAL(5, 2),
  oxygen_saturation INT,
  blood_glucose INT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.patient_biometrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own biometrics" ON public.patient_biometrics
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view patient biometrics" ON public.patient_biometrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.patient_id = patient_biometrics.patient_id
      AND appointments.doctor_id = auth.uid()
    )
  );

-- Voice conversations table
CREATE TABLE IF NOT EXISTS public.voice_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  conversation_data JSONB,
  raw_transcript TEXT,
  symptoms TEXT[],
  duration_seconds INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.voice_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own conversations" ON public.voice_conversations
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view patient conversations" ON public.voice_conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.patient_id = voice_conversations.patient_id
      AND appointments.doctor_id = auth.uid()
    )
  );

-- Risk assessment table
CREATE TABLE IF NOT EXISTS public.risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  voice_conversation_id UUID NOT NULL REFERENCES public.voice_conversations(id) ON DELETE CASCADE,
  risk_score INT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level risk_level NOT NULL,
  assigned_specialty medical_specialty NOT NULL,
  symptoms_detected TEXT[],
  scoring_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own assessments" ON public.risk_assessments
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view patient assessments" ON public.risk_assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.patient_id = risk_assessments.patient_id
      AND appointments.doctor_id = auth.uid()
    )
  );

-- Doctor profiles table
CREATE TABLE IF NOT EXISTS public.doctor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  specialties medical_specialty[] NOT NULL,
  license_number TEXT,
  years_of_experience INT,
  bio TEXT,
  consultation_fee DECIMAL(10, 2),
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_appointments INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view their own profile" ON public.doctor_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Doctors can update their own profile" ON public.doctor_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Patients can view doctor profiles" ON public.doctor_profiles
  FOR SELECT USING (true);

-- Doctor appointment slots table
CREATE TABLE IF NOT EXISTS public.doctor_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INT DEFAULT 30,
  max_patients_per_slot INT DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.doctor_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can manage their own slots" ON public.doctor_slots
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create their own slots" ON public.doctor_slots
  FOR INSERT WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update their own slots" ON public.doctor_slots
  FOR UPDATE USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can view available slots" ON public.doctor_slots
  FOR SELECT USING (is_active = true);

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  risk_assessment_id UUID NOT NULL REFERENCES public.risk_assessments(id) ON DELETE CASCADE,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INT DEFAULT 30,
  status appointment_status DEFAULT 'scheduled',
  reason_for_visit TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view their appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can update appointment status" ON public.appointments
  FOR UPDATE USING (auth.uid() = doctor_id);

-- Medical records table
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  whiteboard_image_url TEXT,
  transcribed_notes TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  prescriptions JSONB,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own records" ON public.medical_records
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view their patient records" ON public.medical_records
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create records" ON public.medical_records
  FOR INSERT WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update their own records" ON public.medical_records
  FOR UPDATE USING (auth.uid() = doctor_id);

-- Create indexes for better query performance
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_patient_profiles_user_id ON public.patient_profiles(user_id);
CREATE INDEX idx_patient_biometrics_patient_id ON public.patient_biometrics(patient_id);
CREATE INDEX idx_voice_conversations_patient_id ON public.voice_conversations(patient_id);
CREATE INDEX idx_risk_assessments_patient_id ON public.risk_assessments(patient_id);
CREATE INDEX idx_risk_assessments_specialty ON public.risk_assessments(assigned_specialty);
CREATE INDEX idx_doctor_profiles_user_id ON public.doctor_profiles(user_id);
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_medical_records_appointment_id ON public.medical_records(appointment_id);
