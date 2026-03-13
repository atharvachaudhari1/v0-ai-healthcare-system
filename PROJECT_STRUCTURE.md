# MediAI Project Structure

Complete visual guide to the MediAI project file organization.

## 📁 Directory Tree

```
mediaihealth/
├── 📄 Documentation Files
│   ├── README.md ........................ Main documentation
│   ├── SETUP.md ......................... Detailed setup guide
│   ├── QUICK_START.md ................... 5-minute quick start
│   ├── RESOURCES.md ..................... API keys & accounts
│   ├── IMPLEMENTATION_SUMMARY.md ........ Technical architecture
│   ├── BUILD_SUMMARY.md ................. Project completion summary
│   ├── DOCS_INDEX.md .................... Documentation navigation
│   └── PROJECT_STRUCTURE.md ............. This file
│
├── 📁 app/ .............................. Next.js App Router
│   ├── layout.tsx ....................... Root layout with fonts
│   ├── page.tsx ......................... Home/landing page
│   ├── globals.css ....................... Global styles & theme
│   │
│   ├── 📁 api/ .......................... API Routes
│   │   ├── 📁 voice-assessment/
│   │   │   └── route.ts ................. Save assessment & scoring
│   │   └── 📁 send-prescription-email/
│   │       └── route.ts ................. Email delivery
│   │
│   ├── 📁 auth/ ......................... Authentication Pages
│   │   ├── login/page.tsx ............... Sign in page
│   │   └── signup/page.tsx .............. Register page
│   │
│   ├── 📁 patient/ ...................... Patient Pages
│   │   ├── 📁 voice-assessment/
│   │   │   └── page.tsx ................. Voice assessment UI
│   │   ├── 📁 book-appointment/
│   │   │   └── page.tsx ................. Booking interface
│   │   └── 📁 appointments/
│   │       └── page.tsx ................. View appointments
│   │
│   ├── 📁 doctor/ ....................... Doctor Pages
│   │   ├── 📁 dashboard/
│   │   │   └── page.tsx ................. Patient queue (risk-sorted)
│   │   └── 📁 appointment/
│   │       └── [id]/page.tsx ............ Appointment session
│   │
│   └── 📁 admin/ ........................ Admin Pages
│       └── dashboard/page.tsx ........... Admin panel
│
├── 📁 components/ ....................... React Components
│   ├── 📁 ui/ ........................... shadcn/ui components
│   │   ├── button.tsx ................... Button component
│   │   ├── card.tsx ..................... Card component
│   │   ├── input.tsx .................... Input component
│   │   ├── textarea.tsx ................. Textarea component
│   │   ├── select.tsx ................... Select dropdown
│   │   ├── dialog.tsx ................... Modal dialog
│   │   ├── label.tsx .................... Label component
│   │   ├── badge.tsx .................... Badge/tag component
│   │   ├── spinner.tsx .................. Loading spinner
│   │   └── [other components] ........... Additional UI components
│   │
│   ├── voice-assessment.tsx ............. Voice assessment interface
│   │                                     - ElevenLabs integration
│   │                                     - Real-time voice chat
│   │                                     - Symptom extraction
│   │
│   ├── doctor-whiteboard.tsx ............ Digital whiteboard
│   │                                     - Canvas drawing
│   │                                     - Gemini Vision transcription
│   │                                     - AI note extraction
│   │
│   ├── appointment-booking.tsx .......... Appointment scheduler
│   │                                     - Doctor selection
│   │                                     - Time slot picking
│   │                                     - Booking confirmation
│   │
│   ├── appointment-interface.tsx ........ Appointment session UI
│   │                                     - Patient info display
│   │                                     - Whiteboard integration
│   │                                     - Prescription entry
│   │                                     - Email sending
│   │
│   ├── doctor-dashboard.tsx ............. Doctor's queue view
│   │                                     - Risk-sorted patient list
│   │                                     - Risk level badges
│   │                                     - Quick patient access
│   │
│   └── accessibility-panel.tsx .......... Accessibility controls
│                                         - Font options
│                                         - High contrast mode
│                                         - Text sizing
│                                         - Spacing adjustment
│
├── 📁 lib/ .............................. Utilities & Libraries
│   ├── risk-scoring.ts .................. ML risk scoring algorithm
│   │                                     - Weighted scoring
│   │                                     - Specialty assignment
│   │                                     - Risk level calculation
│   │
│   ├── voice-agent.ts ................... ElevenLabs configuration
│   │                                     - System prompt
│   │                                     - Agent configuration
│   │                                     - Voice settings
│   │
│   ├── utils.ts ......................... Helper functions
│   │                                     - Date formatting
│   │                                     - Text utilities
│   │                                     - Validation
│   │
│   └── 📁 supabase/ ..................... Supabase utilities
│       ├── client.ts .................... Client-side Supabase
│       └── server.ts .................... Server-side Supabase
│
├── 📁 hooks/ ............................ React Hooks
│   ├── use-mobile.ts .................... Mobile detection hook
│   └── use-toast.ts ..................... Toast notifications hook
│
├── 📁 public/ ........................... Static Assets
│   └── [images, fonts, icons] ........... Public files
│
├── 📁 scripts/ .......................... Database Scripts
│   ├── init-db.sql ...................... Database initialization
│   └── seed-data.sql .................... Test data seeding
│
├── 🔧 Configuration Files
│   ├── package.json ..................... Dependencies & scripts
│   ├── package-lock.json ................ Dependency lock
│   ├── tsconfig.json .................... TypeScript config
│   ├── tailwind.config.js ............... Tailwind configuration
│   ├── postcss.config.js ................ PostCSS configuration
│   ├── next.config.mjs .................. Next.js configuration
│   └── .env.local ....................... Environment variables (gitignored)
│
└── 📝 Git Files
    ├── .gitignore ....................... Ignored files
    └── .git/ ............................ Git history
```

---

## 📊 Component Dependencies

### Voice Assessment Flow
```
page.tsx (voice-assessment)
  ↓
VoiceAssessment Component
  ├── ElevenLabs Integration
  ├── Transcript Display
  └── Symptom Extraction
  
  ↓ API Call
POST /api/voice-assessment
  ├── Risk Scoring Algorithm
  ├── Database Storage
  └── Return Risk Assessment
```

### Appointment Booking Flow
```
page.tsx (book-appointment)
  ↓
AppointmentBooking Component
  ├── DoctorSelection
  │   └── Filter by Specialty
  ├── SlotSelection
  │   └── Filter by Date/Time
  └── Confirmation
  
  ↓ Database Insert
Supabase Appointments Table
```

### Doctor Appointment Flow
```
page.tsx (doctor/dashboard)
  ↓
DoctorDashboard Component
  ├── Patient Queue (risk-sorted)
  ├── Patient Cards
  └── Start Appointment Button
  
  ↓
page.tsx (doctor/appointment/[id])
  ↓
AppointmentInterface Component
  ├── Patient Info Display
  ├── DoctorWhiteboard Component
  │   ├── Canvas Drawing
  │   └── Gemini Transcription
  ├── Prescription Entry
  └── Send Email Button
  
  ↓ API Call
POST /api/send-prescription-email
  └── Resend Integration
```

---

## 🗂️ File Organization by Feature

### Authentication
```
/app/auth/
  ├── login/page.tsx
  └── signup/page.tsx
/lib/supabase/
  ├── client.ts
  └── server.ts
```

### Patient Features
```
/components/
  ├── voice-assessment.tsx
  ├── appointment-booking.tsx
/app/patient/
  ├── voice-assessment/page.tsx
  ├── book-appointment/page.tsx
  └── appointments/page.tsx
/lib/
  └── voice-agent.ts
```

### Doctor Features
```
/components/
  ├── doctor-dashboard.tsx
  ├── appointment-interface.tsx
  ├── doctor-whiteboard.tsx
/app/doctor/
  ├── dashboard/page.tsx
  └── appointment/[id]/page.tsx
/app/api/
  └── send-prescription-email/route.ts
```

### Algorithms & Core Logic
```
/lib/
  ├── risk-scoring.ts
  ├── voice-agent.ts
  └── utils.ts
```

### UI & Styling
```
/components/ui/
  ├── [shadcn components]
/app/
  └── globals.css
```

### Documentation
```
Project Root
├── README.md
├── SETUP.md
├── QUICK_START.md
├── RESOURCES.md
├── IMPLEMENTATION_SUMMARY.md
├── BUILD_SUMMARY.md
├── DOCS_INDEX.md
└── PROJECT_STRUCTURE.md
```

---

## 📝 Key Files Explained

### Core Application Files

**`/app/page.tsx`** - Home Page
- Landing page with feature showcase
- Sign up / Sign in buttons
- Feature overview
- CTA sections

**`/app/layout.tsx`** - Root Layout
- Global layout wrapper
- Font configuration
- HTML setup
- Metadata

**`/app/globals.css`** - Global Styles
- Tailwind CSS configuration
- Design tokens (colors, spacing, fonts)
- Global styles
- Theme variables

### API Routes

**`/app/api/voice-assessment/route.ts`**
- Receives: transcript, symptoms, severity
- Performs: risk scoring
- Returns: risk assessment
- Saves: to database

**`/app/api/send-prescription-email/route.ts`**
- Receives: appointment details, email, prescription
- Integrates: Resend
- Sends: email with summary
- Returns: success/error

### Core Components

**`/components/voice-assessment.tsx`**
- ElevenLabs voice agent integration
- Real-time conversation display
- Symptom extraction
- Transcript management

**`/components/doctor-whiteboard.tsx`**
- HTML5 canvas drawing
- Pressure-sensitive pen simulation
- Clear/reset functionality
- Gemini Vision integration for transcription

**`/components/appointment-booking.tsx`**
- Doctor search and filtering
- Time slot selection
- Booking confirmation
- Database integration

**`/components/appointment-interface.tsx`**
- Patient information display
- Vital signs viewing
- Whiteboard integration
- Prescription entry
- Email sending

### Utilities

**`/lib/risk-scoring.ts`**
- Weighted scoring algorithm
- Risk level calculation
- Specialty assignment
- Severity evaluation

**`/lib/voice-agent.ts`**
- ElevenLabs configuration
- System prompt for medical assessment
- Voice settings
- Agent initialization

---

## 🔄 Data Flow Diagram

```
Patient
  ↓
Sign Up
  ↓
Biometric Entry
  ↓
Voice Assessment ──→ voice-assessment.tsx
                          ↓
                    /api/voice-assessment
                          ↓
                    risk-scoring.ts
                          ↓
                    Supabase
  ↓
View Risk Score
  ↓
Book Appointment
  ↓
appointment-booking.tsx
        ↓
   Supabase
        ↓
Doctor
  ↓
doctor-dashboard.tsx
        ↓
View Patient Queue (sorted by risk)
        ↓
Click Patient
        ↓
appointment-interface.tsx
        ├── doctor-whiteboard.tsx
        │       ↓
        │  Gemini Vision API
        │       ↓
        │  Transcription
        └── Prescription Entry
        ↓
/api/send-prescription-email
        ↓
Resend
        ↓
Email → Patient
```

---

## 🎯 Where to Find Things

### Want to understand the UI?
- Start: `/components/`
- Look at: Component structure and props
- Related: `/app/globals.css` for styling

### Want to understand the database?
- Start: `/lib/supabase/client.ts` and `server.ts`
- Look at: Table schemas in SETUP.md
- Related: `/app/api/` for database queries

### Want to understand the AI integration?
- Start: `/lib/voice-agent.ts` for voice
- Start: `/lib/risk-scoring.ts` for risk algorithm
- Look at: `/components/voice-assessment.tsx` and `doctor-whiteboard.tsx`

### Want to understand the flows?
- Start: `/app/` for page structure
- Look at: Component composition
- Related: `/components/` for individual components

### Want to add a new feature?
- Create component: `/components/my-feature.tsx`
- Create page: `/app/my-feature/page.tsx`
- Create API route: `/app/api/my-feature/route.ts`
- Add to database: Update Supabase schema
- Update documentation: Add to README.md

---

## 📦 Dependency Tree

```
Next.js
├── React
├── TypeScript
└── Tailwind CSS

Supabase
├── @supabase/supabase-js
└── PostgreSQL

ElevenLabs
└── @elevenlabs/conversational-ai

Google Gemini
└── @google/generative-ai

Resend
└── resend

UI Components
└── shadcn/ui
    └── Radix UI

Utilities
├── html2canvas
└── date-fns
```

---

## 🔐 Security Files

```
.env.local (⚠️ KEEP SECRET)
  ├── NEXT_PUBLIC_SUPABASE_URL
  ├── NEXT_PUBLIC_SUPABASE_ANON_KEY
  ├── NEXT_PUBLIC_ELEVENLABS_API_KEY
  ├── NEXT_PUBLIC_ELEVENLABS_AGENT_ID
  ├── NEXT_PUBLIC_GEMINI_API_KEY
  └── RESEND_API_KEY

.gitignore
  └── Prevents .env.local from being committed
```

---

## 🚀 Build Output

When you run `npm run build`, it creates:

```
.next/ (gitignored)
├── standalone/ ...................... Server files
├── static/ .......................... Static assets
├── server/ .......................... API routes
└── [build artifacts] ................ Compiled code
```

---

## 📝 File Naming Conventions

- **Pages**: `page.tsx` (always this name in App Router)
- **Layout**: `layout.tsx` (always this name)
- **Components**: `PascalCase.tsx` (e.g., `VoiceAssessment.tsx`)
- **Utilities**: `camelCase.ts` (e.g., `riskScoring.ts`)
- **API Routes**: `route.ts` (always this name in `/api/`)

---

## 🎓 Navigation Tips

### To find a feature:
1. Look in `/components/` for the component
2. Look in `/app/` for the page that uses it
3. Look in `/lib/` for supporting utilities
4. Look in `/app/api/` for API endpoints

### To understand the code:
1. Start with `/app/` to see the page structure
2. Look at the imported components
3. Check component props
4. See the implementation in `/components/`

### To deploy:
1. Check `/app/` for all routes
2. Check `/app/api/` for all endpoints
3. Check `/lib/` for any environment variables
4. Check `.env.local` for required variables

---

## ✅ Complete Structure Checklist

- ✅ Pages organized in App Router
- ✅ Components separated by feature
- ✅ Utilities in `/lib/`
- ✅ UI components in `/components/ui/`
- ✅ Styles in globals.css
- ✅ API routes in `/app/api/`
- ✅ Documentation at project root
- ✅ Configuration files in root
- ✅ Environment variables in `.env.local`

---

**This structure makes the project:**
- 🎯 Easy to navigate
- 🔍 Easy to find files
- 📦 Easy to extend
- 🧪 Easy to test
- 🚀 Easy to deploy

---

**Last Updated**: March 13, 2024
**Status**: Complete ✅
