-- Disease Predictions Table
CREATE TABLE IF NOT EXISTS public.disease_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Input data
  symptoms TEXT[] NOT NULL, -- Array of symptom strings
  pain_location TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  severity_score NUMERIC(3,1) NOT NULL CHECK (severity_score >= 1 AND severity_score <= 10),
  age_group VARCHAR(50),
  weight NUMERIC(5,1),
  height NUMERIC(5,1),
  bmi NUMERIC(5,2),
  
  -- ML Model Output
  predicted_disease TEXT NOT NULL,
  confidence_score NUMERIC(5,3) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  risk_level VARCHAR(20) NOT NULL DEFAULT 'Medium', -- Low, Medium, High, Critical
  top_3_predictions JSONB NOT NULL, -- Array of {disease, probability}
  
  -- Gemini AI Explanation
  ai_explanation TEXT,
  precautions TEXT[],
  doctor_consultation_guidance TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_reviewed_by_doctor BOOLEAN DEFAULT FALSE,
  doctor_notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.disease_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Patients can view their own predictions" ON public.disease_predictions
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create predictions" ON public.disease_predictions
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update their own predictions" ON public.disease_predictions
  FOR UPDATE USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view patient predictions" ON public.disease_predictions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.patient_id = patient_id
      AND a.doctor_id = (
        SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Prediction History Index
CREATE INDEX IF NOT EXISTS idx_disease_predictions_patient_created
  ON public.disease_predictions(patient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_disease_predictions_disease
  ON public.disease_predictions(predicted_disease);

-- Disease Lookup Table
CREATE TABLE IF NOT EXISTS public.disease_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_name TEXT UNIQUE NOT NULL,
  common_symptoms TEXT[],
  typical_duration VARCHAR(100),
  severity_range VARCHAR(100),
  specialist_type TEXT,
  when_to_see_doctor TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert common diseases reference data
INSERT INTO public.disease_reference (disease_name, common_symptoms, typical_duration, severity_range, specialist_type, when_to_see_doctor) VALUES
  ('Common Cold', ARRAY['cough', 'runny_nose', 'sore_throat', 'fatigue'], '7-10 days', 'Mild to Moderate', 'General Practitioner', 'Persistent symptoms beyond 2 weeks'),
  ('Flu', ARRAY['fever', 'cough', 'body_aches', 'fatigue', 'headache'], '3-7 days', 'Mild to Severe', 'General Practitioner', 'High fever, difficulty breathing'),
  ('COVID-19', ARRAY['fever', 'cough', 'fatigue', 'loss_of_taste', 'loss_of_smell'], '2-4 weeks', 'Mild to Critical', 'Infectious Disease Specialist', 'Difficulty breathing, chest pain'),
  ('Allergies', ARRAY['runny_nose', 'cough', 'sore_throat'], 'Variable', 'Mild', 'Allergist', 'Symptoms worsen or persist'),
  ('Asthma', ARRAY['shortness_of_breath', 'cough', 'chest_pain'], 'Chronic', 'Mild to Critical', 'Pulmonologist', 'Severe breathing difficulty'),
  ('Migraine', ARRAY['headache', 'nausea', 'vomiting'], '4-72 hours', 'Moderate to Severe', 'Neurologist', 'Severe headache with vision changes'),
  ('Gastroenteritis', ARRAY['nausea', 'vomiting', 'diarrhea', 'stomach_pain'], '1-3 days', 'Mild to Moderate', 'Gastroenterologist', 'Signs of dehydration'),
  ('Appendicitis', ARRAY['stomach_pain', 'fever', 'nausea'], 'Acute', 'Moderate to Critical', 'Surgeon', 'Severe abdominal pain, fever'),
  ('Arthritis', ARRAY['joint_pain', 'muscle_pain', 'fatigue'], 'Chronic', 'Mild to Severe', 'Rheumatologist', 'Persistent joint swelling, pain');

-- Enable RLS on disease_reference (public read)
ALTER TABLE public.disease_reference ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view disease reference" ON public.disease_reference
  FOR SELECT USING (TRUE);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_disease_predictions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS disease_predictions_updated_at ON public.disease_predictions;

CREATE TRIGGER disease_predictions_updated_at
  BEFORE UPDATE ON public.disease_predictions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_disease_predictions_timestamp();
