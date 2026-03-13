# MediAI Healthcare System - Complete Setup Guide

A comprehensive AI-powered healthcare platform with voice assessment, risk scoring, and intelligent doctor appointment management.

## 🎯 Key Features

✅ **Role-Based Access Control**
- Patient, Doctor, and Admin role-based authentication
- Supabase Auth with email/password and session management

✅ **Patient Workflow**
- Biometric data collection (age, weight, height, vitals, medical history)
- AI voice agent assessment with natural conversation (ElevenLabs)
- Intelligent risk scoring algorithm (0-100 scale)
- Smart appointment booking with specialty recommendations
- Email delivery of appointment summaries and prescriptions

✅ **Doctor Workflow**
- Smart appointment queue sorted by medical urgency (risk priority)
- Patient dashboard with complete medical history and vitals
- Digital whiteboard for clinical notes and observations
- AI transcription of whiteboard drawings (Gemini Vision)
- Prescription and medical record management
- Automated email delivery to patients

✅ **Admin Dashboard**
- Platform analytics and statistics
- System health monitoring
- Doctor verification and management
- User metrics and appointment tracking

✅ **Accessibility Compliance**
- ADHD/dyslexia-friendly OpenDyslexic font
- High contrast mode for visual impairment
- Expanded spacing for better readability
- Reduced motion for vestibular disorders
- Customizable text sizes (up to 125%)
- Full keyboard navigation support
- Screen reader compatible (semantic HTML + ARIA)

## Environment Variables

Create a `.env.local` file with the following variables:

### Supabase (Required)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### ElevenLabs (Required for voice assessment)
```
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id
```

### Gemini Vision (Required for whiteboard transcription)
```
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### Resend (Required for email)
```
RESEND_API_KEY=your_resend_api_key
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Setup Supabase

1. Create a Supabase project at https://supabase.com
2. Get your project URL and anon key from project settings
3. Add them to `.env.local`

The database migrations have already been created in `/scripts/` - they will be automatically applied.

### 3. Setup ElevenLabs

1. Create an ElevenLabs account at https://elevenlabs.io
2. Create an agent for medical assessment
3. Copy your API key and Agent ID to `.env.local`

#### Medical Intake Agent System Prompt

The system uses the following prompt for voice assessments:

```
You are MediAI, a professional medical intake specialist AI agent. Your role is to conduct a thorough medical assessment through conversation with the patient.

ASSESSMENT PROTOCOL:
1. Greeting & Explanation
2. Chief Complaint Assessment
3. Detailed Symptom Evaluation (severity, duration, frequency, associated symptoms)
4. Critical Symptom Screening
5. Medical Context Questions
6. Summary and Risk Categorization

RISK CATEGORIZATION:
- CRITICAL: Immediate symptoms requiring urgent care
- HIGH: Serious symptoms needing specialist within hours
- MEDIUM: Significant concerns needing specialist within days
- LOW: Minor concerns suitable for general practice
```

### 4. Setup Gemini Vision

1. Create a Google Cloud project
2. Enable Gemini API
3. Create API key
4. Add to `.env.local`

### 5. Setup Resend

1. Create account at https://resend.com
2. Verify your domain
3. Get API key and add to `.env.local`

### 6. Run the Application

```bash
npm run dev
```

Visit http://localhost:3000

## User Flows

### Patient Flow
1. **Sign Up** → Select "Patient" role
2. **Enter Biometrics** → Age, weight, height, vitals, medical history
3. **Voice Assessment** → Talk with AI about symptoms (5-10 min)
4. **View Risk Score** → See risk assessment results
5. **Book Appointment** → Select doctor and time slot
6. **Wait for Appointment** → Doctor queue is sorted by risk

### Doctor Flow
1. **Sign Up** → Select "Doctor" role
2. **View Queue** → See patients sorted by risk level
3. **Open Appointment** → View patient info and symptoms
4. **Document Notes** → Use whiteboard to draw/write notes
5. **Transcribe** → AI automatically converts notes to text
6. **Complete** → System sends email with prescription and notes

## Risk Scoring Algorithm

The system uses weighted scoring:

- **Symptoms (40%)**: Critical symptoms = max points
- **Vitals (30%)**: Abnormal blood pressure, heart rate, temperature
- **Age (15%)**: Very young (<5) or old (>75) = higher risk
- **Medical History (15%)**: Chronic conditions = risk multiplier

**Risk Levels:**
- 0-39: Low
- 40-59: Medium
- 60-79: High
- 80-100: Critical

## Specialty Assignment

The system automatically assigns patients to specialties based on symptoms:

- **Chest pain** → Cardiology
- **Breathing issues** → Pulmonology
- **Headaches** → Neurology
- **Stomach issues** → Gastroenterology
- **Bone/joint** → Orthopedics
- **Skin** → Dermatology
- **Mental health** → Psychiatry
- **General** → General Practice

## Accessibility Features

Toggle via the "A" button in the bottom-right:

- **Dyslexia-Friendly Font** → Uses OpenDyslexic
- **High Contrast** → Black text on white background
- **Reduce Motion** → Minimizes animations
- **Larger Text** → Increases font sizes globally
- **Expanded Spacing** → More whitespace
- **Simplified UI** → Removes complex elements

## API Endpoints

### Voice Assessment Processing
**Endpoint**: `POST /api/elevenlabs/process`

**Purpose**: Process voice conversation transcript from ElevenLabs agent, extract symptoms, and calculate risk score

**Request Body**:
```json
{
  "transcript": "Patient says they have chest pain...",
  "userId": "patient-uuid",
  "appointmentId": "appointment-uuid",
  "duration": 420
}
```

**Response**:
```json
{
  "success": true,
  "assessment": {
    "symptoms": "Chest pain, shortness of breath",
    "severity": 8,
    "duration": "Days",
    "specialty": "Cardiology",
    "risk_score": 75,
    "risk_level": "high",
    "notes": "Patient experiencing chest pain..."
  }
}
```

**Features**:
- Parses transcript for symptoms using keyword matching
- Calculates severity (1-10 scale)
- Detects critical symptoms (chest pain, breathing difficulty, etc.)
- Assigns appropriate medical specialty
- Saves voice conversation to database
- Stores risk assessment for appointment queue prioritization

### Send Prescription Email
**Endpoint**: `POST /api/send-prescription-email`

**Purpose**: Send appointment summary, prescription, and clinical notes to patient via email

**Request Body**:
```json
{
  "appointmentId": "appointment-uuid",
  "patientEmail": "patient@example.com",
  "patientName": "John Doe",
  "transcription": "Patient presented with...",
  "whiteboardImage": "data:image/png;base64,...",
  "prescription": "Amoxicillin 500mg...",
  "notes": "Follow-up in 1 week..."
}
```

**Response**:
```json
{
  "success": true,
  "messageId": "res_123456789"
}
```

**Features**:
- Formats prescription and notes into professional HTML email
- Attaches whiteboard image if provided
- Includes appointment summary
- Uses Resend service for reliable delivery
- Saves delivery confirmation to medical_records table

## Database Schema

### Users
- id (UUID)
- email
- role (patient | doctor | admin)

### Patient Profiles
- user_id
- full_name
- email

### Biometrics
- patient_id
- age, weight, height
- blood pressure, heart rate, temperature
- medical history, allergies, medications

### Voice Conversations
- patient_id
- conversation_id (ElevenLabs)
- transcript
- symptoms
- severity score

### Risk Assessments
- patient_id
- risk_score (0-100)
- risk_level
- recommended_specialty
- symptoms
- risk_factors

### Doctor Profiles
- user_id
- full_name
- specialties
- bio
- rating

### Appointment Slots
- doctor_id
- date
- time
- is_available

### Appointments
- patient_id
- doctor_id
- appointment_slot_id
- scheduled_date
- scheduled_time
- risk_level
- status

### Medical Records
- patient_id
- appointment_id
- transcription
- prescription
- notes
- email_sent

## Troubleshooting

### "ElevenLabs API key not configured"
- Add `NEXT_PUBLIC_ELEVENLABS_API_KEY` to `.env.local`
- Restart the development server

### "Gemini API key not configured"
- Add `NEXT_PUBLIC_GEMINI_API_KEY` to `.env.local`
- Restart the development server

### "Resend not installed"
- Run `npm install resend`

### Database errors
- Check Supabase connection
- Verify migrations were applied
- Check RLS policies are configured

## Next Steps

1. **Deploy to Vercel**: Push to GitHub, connect to Vercel
2. **Add Doctor Profiles**: Create doctor accounts and setup specialties
3. **Setup Email Domain**: Verify domain with Resend
4. **Configure ElevenLabs Agent**: Fine-tune medical assessment prompt
5. **Test Full Flow**: Create test accounts for patients and doctors

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review logs in the browser console
3. Verify all environment variables are set
4. Check Supabase dashboard for database errors

## License

MIT
