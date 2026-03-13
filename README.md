# MediAI - AI-Powered Healthcare Platform

A comprehensive healthcare platform featuring AI voice assessment, intelligent risk scoring, doctor appointment management, and accessible design for all users.

## 🎯 Project Overview

MediAI combines multiple AI technologies to create a modern healthcare system:

- **Voice Assessment**: AI-powered medical intake using ElevenLabs voice agents
- **Risk Scoring**: ML algorithm for patient triage and severity assessment
- **Smart Queue**: Doctors see patients sorted by medical urgency
- **Digital Whiteboard**: Doctors draw/write notes, AI transcribes with Gemini Vision
- **Email Integration**: Automated prescription delivery via Resend
- **Accessibility**: ADHD/dyslexia-friendly modes, high contrast, reduced motion

## 📋 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **SWR** - Data fetching and client-side state

### Backend & Services
- **Supabase** - PostgreSQL database + authentication
- **ElevenLabs** - Voice assessment AI agent
- **Google Gemini Vision** - Whiteboard transcription
- **Resend** - Email delivery
- **Next.js API Routes** - Backend endpoints

### Libraries
- `html2canvas` - Canvas to image conversion
- `bcrypt` - Password hashing
- `@supabase/supabase-js` - Supabase client

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd mediaihealth
npm install
# or
pnpm install
```

### 2. Environment Setup

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# ElevenLabs Voice
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_api_key
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id

# Gemini Vision
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key

# Resend Email
RESEND_API_KEY=your_api_key
```

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 📚 User Flows

### Patient Journey

```
Sign Up → Enter Biometrics → Voice Assessment → Risk Score → Book Appointment → Wait
```

**Patient Steps:**
1. Sign up with email/password (role: patient)
2. Complete biometric form (age, weight, height, vitals, medical history)
3. Take voice assessment with AI agent (~5-10 minutes)
4. View risk assessment and recommended specialty
5. Book appointment with available doctor
6. Receive appointment confirmation

### Doctor Journey

```
Sign Up → Create Profile → View Queue → Open Appointment → Take Notes → Complete
```

**Doctor Steps:**
1. Sign up with email/password (role: doctor)
2. Set specialties and availability
3. View patient queue (sorted by risk priority)
4. Open patient appointment
5. Review patient data and symptoms
6. Use digital whiteboard to document notes
7. Transcribe notes with AI
8. Complete appointment (auto-sends email to patient)

## 🏗️ Architecture

### Database Schema

**Authentication**
- Users table (Supabase Auth)
- Roles: patient, doctor, admin

**Patient Data**
- `patient_profiles` - Name, contact, demographics
- `biometrics` - Vitals, medical history, allergies, medications
- `appointments` - Scheduled visits with doctors
- `medical_records` - Visit notes, prescriptions, transcriptions

**Doctor Data**
- `doctor_profiles` - Name, specialties, bio, rating
- `appointment_slots` - Available time slots
- `voice_conversations` - Assessment transcripts and symptoms
- `risk_assessments` - Risk scores and severity levels

### Component Structure

```
/components
  ├── voice-assessment.tsx          # Patient voice intake UI
  ├── doctor-dashboard.tsx          # Queue view sorted by risk
  ├── doctor-whiteboard.tsx         # Canvas drawing + transcription
  ├── appointment-booking.tsx       # Patient appointment scheduler
  ├── appointment-interface.tsx     # Doctor session interface
  ├── accessibility-panel.tsx       # Theme/font/spacing controls
  └── ui/                          # shadcn components

/app
  ├── page.tsx                     # Home/landing
  ├── patient/
  │   ├── voice-assessment/page.tsx
  │   └── book-appointment/page.tsx
  ├── doctor/
  │   ├── dashboard/page.tsx
  │   └── appointment/[id]/page.tsx
  └── api/
      ├── voice-assessment/route.ts
      └── send-prescription-email/route.ts

/lib
  ├── risk-scoring.ts              # ML algorithm
  ├── supabase/
  │   ├── client.ts
  │   └── server.ts
  └── voice-agent.ts               # ElevenLabs config
```

## 🔧 Risk Scoring Algorithm

The system uses an intelligent weighted scoring model that analyzes multiple factors:

**Scoring Components:**

1. **Symptom Severity (40% weight - 0-40 points)**
   - 1-10 scale from patient or voice assessment
   - Direct multiplication: severity × 4 = points

2. **Critical Symptoms (20% weight - 0-20 points)**
   - Chest pain, breathing difficulty, unconsciousness
   - Automatically adds 20 points if detected in transcript
   - Overrides normal severity scoring

3. **Vital Signs (30% weight - 0-30 points)**
   - Blood Pressure: >180 (15pts), >160 (10pts), >140 (5pts)
   - Heart Rate: >120 (8pts), >100 (4pts)
   - Temperature: >38.5°C (5pts)
   - Cumulative scoring for abnormalities

4. **Age Factor (10% weight - 0-15 points)**
   - >75 years: 15 points
   - 60-75 years: 8 points
   - 50-60 years: 4 points

**Risk Levels:**
- **0-39: Low** - General practice suitable, can wait days
- **40-59: Medium** - Specialist within days, non-urgent
- **60-79: High** - Specialist within hours, concerning
- **80-100: Critical** - Emergency care, life-threatening

**Specialty Assignment Logic:**

The system recommends specialties based on symptom keywords:
- "chest" or "heart" → **Cardiology**
- "headache" or "migraine" → **Neurology**
- "stomach" or "abdominal" → **Gastroenterology**
- "breath" or "lung" → **Pulmonology**
- "joint" or "bone" → **Orthopedics**
- Default → **General Practice**

**Example Risk Calculations:**

*Patient A: Chest pain*
- Symptom severity: 8/10 = 32 points
- Critical symptom (chest): +20 points
- BP: 165/95 = 10 points
- HR: 105 = 4 points
- Age: 55 = 4 points
- **Total: 70 points (HIGH risk) → Cardiology**

*Patient B: Mild cough*
- Symptom severity: 3/10 = 12 points
- No critical symptoms: 0 points
- Normal vitals = 0 points
- Age: 35 = 0 points
- **Total: 12 points (LOW risk) → Pulmonology**

## ♿ Accessibility Features

Click the "A" button (bottom-right) to access:

- **Dyslexia Mode**: OpenDyslexic font (easier reading)
- **High Contrast**: Black text on white (better visibility)
- **Reduce Motion**: Disables animations (helps ADHD)
- **Larger Text**: Scales all fonts (+25%)
- **Expanded Spacing**: More whitespace between elements
- **Simplified UI**: Removes decorative elements

## 📱 Key Pages

### Public Pages
- `/` - Home/landing page with feature overview

### Patient Pages
- `/patient/voice-assessment` - AI voice intake
- `/patient/book-appointment` - Schedule with doctor
- `/patient/appointments` - View booked appointments

### Doctor Pages
- `/doctor/dashboard` - Queue view (risk-sorted)
- `/doctor/appointment/[id]` - Appointment interface with whiteboard

### Auth Pages
- `/auth/login` - Sign in
- `/auth/signup` - Create account with role selection

## 🔌 API Endpoints

### ElevenLabs Voice Processing
```
POST /api/elevenlabs/process
Body: {
  transcript: string
  userId: string
  appointmentId?: string
  duration?: number
}
Response: {
  success: boolean
  assessment: {
    symptoms: string
    severity: number (1-10)
    duration: string
    specialty: string
    risk_score: number (0-100)
    risk_level: "critical" | "high" | "medium" | "low"
    notes: string
  }
}
```
Processes voice conversation from ElevenLabs agent, extracts symptoms, calculates risk score, and saves assessment to database.

### Send Prescription Email
```
POST /api/send-prescription-email
Body: {
  appointmentId: string
  patientEmail: string
  patientName: string
  transcription: string
  whiteboardImage: string
  prescription?: string
  notes?: string
}
Response: {
  success: boolean
  messageId: string
}
```
Sends appointment summary, prescription, notes, and whiteboard image to patient via Resend email service.

## 🎨 Customization

### Colors & Theme
Edit `/app/globals.css` design tokens:
```css
@theme inline {
  --color-primary: #2563eb;
  --color-secondary: #7c3aed;
  --color-destructive: #dc2626;
}
```

### Fonts
Modify `/app/layout.tsx`:
```tsx
import { YourFont } from 'next/font/google'
const font = YourFont({ subsets: ['latin'] })
```

### Medical Prompts
Update voice agent system prompt in `/lib/voice-agent.ts`

## 🚀 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel Settings
4. Deploy!

```bash
git push origin main
```

### Production Checklist

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] ElevenLabs agent configured
- [ ] Resend domain verified
- [ ] Doctor profiles created
- [ ] Appointment slots configured
- [ ] SSL certificate enabled
- [ ] Error monitoring setup (Sentry optional)

## 🔐 Security

- **Authentication**: Supabase Auth with JWT tokens
- **Password**: bcrypt hashing (minimum 10 rounds)
- **Database**: Row-Level Security (RLS) policies
- **API**: Route protection with auth checks
- **Sensitive Data**: Server-side API keys only
- **Input Validation**: TypeScript + runtime checks

## 📊 Performance

- **Caching**: SWR for client-side data fetching
- **Images**: Next.js Image optimization
- **Code Splitting**: Automatic route-based splitting
- **Compression**: Gzip + Brotli
- **CDN**: Vercel Edge Network

## 🧪 Testing

```bash
# Run tests (if configured)
npm run test

# Build for production
npm run build

# Start production server
npm start
```

## 📖 Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Risk Scoring](./lib/risk-scoring.ts) - Algorithm explanation
- [Component Docs](./components/README.md) - UI components

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

### Common Issues

**"ElevenLabs not configured"**
- Add `NEXT_PUBLIC_ELEVENLABS_API_KEY` to `.env.local`
- Restart dev server

**"Gemini API error"**
- Verify API key is correct
- Check Google Cloud project has Gemini API enabled

**"Resend email not sending"**
- Confirm `RESEND_API_KEY` is set
- Verify domain is verified in Resend dashboard

**Database connection issues**
- Check Supabase URL and key are correct
- Verify network connection
- Check database status in Supabase dashboard

### Getting Help

1. Check [SETUP.md](./SETUP.md) troubleshooting section
2. Review error logs in browser console
3. Check server logs: `npm run dev` output
4. Verify all API keys are valid

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Guide](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [ElevenLabs API](https://elevenlabs.io/docs)
- [Gemini Vision API](https://cloud.google.com/vertex-ai/generative-ai/docs/vision/overview)

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Video consultations (WebRTC)
- [ ] Payment processing (Stripe)
- [ ] Analytics dashboard (Mixpanel)
- [ ] Multi-language support (i18n)
- [ ] Prescription management (e-prescriptions)
- [ ] Insurance integration
- [ ] Telemedicine waiting room

## 💡 Tips

- **Development**: Use `npm run dev` with browser dev tools open
- **Database**: View data via Supabase dashboard
- **Testing**: Create test accounts for each role
- **Performance**: Use Chrome DevTools Lighthouse
- **Accessibility**: Test with keyboard navigation

---

**Made with ❤️ for better healthcare through AI**
