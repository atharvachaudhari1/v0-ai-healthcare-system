# MediAI User Flows

Complete visual guide to all user flows in the MediAI healthcare platform.

## 🎯 User Flow Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    MEDIẢI SYSTEM FLOWS                       │
├──────────────────────┬──────────────────┬──────────────────┐
│   PATIENT FLOW       │   DOCTOR FLOW    │    ADMIN FLOW    │
├──────────────────────┼──────────────────┼──────────────────┤
│ 1. Sign Up           │ 1. Sign Up       │ 1. Sign In       │
│ 2. Biometrics       │ 2. Setup Profile │ 2. Dashboard     │
│ 3. Voice Assessment │ 3. View Queue    │ 3. Manage Users  │
│ 4. Risk Score       │ 4. Open Patient  │ 4. Analytics     │
│ 5. Book Appointment │ 5. Take Notes    │ 5. Settings      │
│ 6. Confirmation     │ 6. Send Email    │                  │
└──────────────────────┴──────────────────┴──────────────────┘
```

---

## 👤 Patient Flow

### Complete Patient Journey

```
START
  ↓
┌─────────────────────────────────────┐
│   HOME PAGE (/)                     │
│   - Learn about features            │
│   - "Sign Up" CTA                   │
└─────────────────────────────────────┘
  ↓ Click "Sign Up as Patient"
┌─────────────────────────────────────┐
│   SIGNUP PAGE (/auth/signup)        │
│   - Email input                     │
│   - Password input                  │
│   - Role: Patient (pre-selected)    │
│   - Create Account button           │
└─────────────────────────────────────┘
  ↓ Enter email & password, click Create
┌─────────────────────────────────────┐
│   EMAIL VERIFICATION                │
│   - Check email                     │
│   - Confirm email address           │
│   - Return to app                   │
└─────────────────────────────────────┘
  ↓ Email verified
┌─────────────────────────────────────┐
│   DASHBOARD (/patient/dashboard)    │
│   - Welcome message                 │
│   - Next steps                      │
│   - Biometrics button               │
└─────────────────────────────────────┘
  ↓ Click "Enter Health Information"
┌─────────────────────────────────────┐
│   BIOMETRICS FORM                   │
│   - Age (years)                     │
│   - Weight (kg)                     │
│   - Height (cm)                     │
│   - Blood Pressure                  │
│   - Heart Rate                      │
│   - Temperature                     │
│   - Medical History                 │
│   - Allergies                       │
│   - Current Medications             │
│   - Submit button                   │
└─────────────────────────────────────┘
  ↓ Form submitted
┌─────────────────────────────────────┐
│   CONFIRMATION MESSAGE              │
│   ✓ Data saved successfully         │
│   - Ready for assessment            │
│   - Next: Voice Assessment          │
└─────────────────────────────────────┘
  ↓ Click "Start Voice Assessment"
┌─────────────────────────────────────┐
│   VOICE ASSESSMENT                  │
│   (/patient/voice-assessment)       │
│                                     │
│   AI Agent says:                    │
│   "Hello, I'm MediAI..."            │
│                                     │
│   Patient speaks about symptoms     │
│   AI listens and responds           │
│   (5-10 minute conversation)        │
│                                     │
│   Topics covered:                   │
│   - Chief complaint                 │
│   - Symptom severity                │
│   - Duration and frequency          │
│   - Associated symptoms             │
│   - Medical context                 │
│                                     │
│   [Start Recording] [Stop]          │
│   [Transcript display]              │
└─────────────────────────────────────┘
  ↓ Assessment complete (auto-save)
┌─────────────────────────────────────┐
│   RISK ASSESSMENT RESULTS           │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ Risk Score: 62/100          │   │
│   │ Risk Level: HIGH            │   │
│   ├─────────────────────────────┤   │
│   │ Recommended Specialty:      │   │
│   │ Cardiology                  │   │
│   ├─────────────────────────────┤   │
│   │ Key Findings:               │   │
│   │ • Chest pain                │   │
│   │ • Elevated heart rate       │   │
│   │ • Family history of MI      │   │
│   └─────────────────────────────┘   │
│                                     │
│   [Book Appointment] button         │
└─────────────────────────────────────┘
  ↓ Click "Book Appointment"
┌─────────────────────────────────────┐
│   APPOINTMENT BOOKING               │
│   (/patient/book-appointment)       │
│                                     │
│   Step 1: Select Doctor             │
│   ┌─────────────────────────────┐   │
│   │ Speciality: Cardiology ▼   │   │
│   │ Doctor: Dr. Smith           │   │
│   │ Rating: ★★★★★              │   │
│   │ Available: Today, 2 PM      │   │
│   │ [Select]                    │   │
│   └─────────────────────────────┘   │
│                                     │
│   Step 2: Select Time Slot          │
│   ┌─────────────────────────────┐   │
│   │ Date: [Today] ▼             │   │
│   │ Times: 2 PM [Selected]      │   │
│   │        3 PM                 │   │
│   │        4 PM                 │   │
│   └─────────────────────────────┘   │
│                                     │
│   Step 3: Confirm                   │
│   ┌─────────────────────────────┐   │
│   │ Doctor: Dr. Smith           │   │
│   │ Date: Today                 │   │
│   │ Time: 2 PM                  │   │
│   │ Specialty: Cardiology       │   │
│   │ [Confirm Appointment]       │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
  ↓ Click "Confirm Appointment"
┌─────────────────────────────────────┐
│   CONFIRMATION                      │
│                                     │
│   ✓ Appointment Booked!             │
│                                     │
│   Your appointment details:         │
│   • Doctor: Dr. Smith               │
│   • Specialty: Cardiology           │
│   • Date: Today                     │
│   • Time: 2 PM                      │
│   • Location: Online/Clinic         │
│                                     │
│   Confirmation email sent to:       │
│   patient@example.com               │
│                                     │
│   [View My Appointments]            │
│   [Go to Dashboard]                 │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│   WAIT FOR APPOINTMENT              │
│   - Email confirmation received     │
│   - Can view in dashboard           │
│   - Join at scheduled time          │
│   - Can cancel/reschedule           │
└─────────────────────────────────────┘
  ↓ At appointment time
┌─────────────────────────────────────┐
│   APPOINTMENT SESSION               │
│   (Video/Chat with doctor)          │
│                                     │
│   - Join appointment                │
│   - Chat with doctor                │
│   - Share symptoms                  │
│   - Receive diagnosis               │
│   - Get prescription                │
└─────────────────────────────────────┘
  ↓ Appointment ends
┌─────────────────────────────────────┐
│   RECEIPT EMAIL                     │
│   Received at: patient@example.com  │
│                                     │
│   Contains:                         │
│   • Appointment summary             │
│   • Doctor notes                    │
│   • Diagnosis                       │
│   • Prescription                    │
│   • Follow-up instructions          │
│                                     │
│   Next steps: Follow doctor's       │
│   instructions, schedule follow-up  │
└─────────────────────────────────────┘
  ↓
END

PATIENT JOURNEY: COMPLETE ✓
```

---

## 👨‍⚕️ Doctor Flow

### Complete Doctor Journey

```
START
  ↓
┌─────────────────────────────────────┐
│   HOME PAGE (/)                     │
│   - Learn about features            │
│   - "Sign Up as Doctor" CTA         │
└─────────────────────────────────────┘
  ↓ Click "Sign Up as Doctor"
┌─────────────────────────────────────┐
│   SIGNUP PAGE (/auth/signup)        │
│   - Email input                     │
│   - Password input                  │
│   - Role: Doctor (selected)         │
│   - Create Account button           │
└─────────────────────────────────────┘
  ↓ Enter details, click Create
┌─────────────────────────────────────┐
│   DOCTOR PROFILE SETUP              │
│   - Full Name                       │
│   - Medical License                 │
│   - Specialties (select multiple):  │
│     ☐ Cardiology                    │
│     ☐ Neurology                     │
│     ☐ Pulmonology                   │
│     ☐ Etc.                          │
│   - Bio/Description                 │
│   - Available Hours                 │
│   - [Complete Profile]              │
└─────────────────────────────────────┘
  ↓ Profile completed
┌─────────────────────────────────────┐
│   DOCTOR DASHBOARD                  │
│   (/doctor/dashboard)               │
│                                     │
│   Welcome! Your Patient Queue:      │
│                                     │
│   Sorted by Risk Level:             │
│   ┌─────────────────────────────┐   │
│   │ 🔴 CRITICAL - 1 patient     │   │
│   │ 🟠 HIGH - 3 patients        │   │
│   │ 🟡 MEDIUM - 2 patients      │   │
│   │ 🟢 LOW - 1 patient          │   │
│   └─────────────────────────────┘   │
│                                     │
│   [View All Patients]               │
└─────────────────────────────────────┘
  ↓ Click on a patient
┌─────────────────────────────────────┐
│   PATIENT QUEUE VIEW                │
│                                     │
│   Patient Cards (Risk Sorted):      │
│                                     │
│   Card 1: [CRITICAL] 🔴            │
│   ├─ John Smith, 45M               │
│   ├─ Symptoms: Chest pain          │
│   ├─ Risk Score: 85/100            │
│   ├─ Risk Level: CRITICAL          │
│   ├─ Vital: BP 180/120, HR 110    │
│   └─ [View & Start] [Urgent]      │
│                                     │
│   Card 2: [HIGH] 🟠                │
│   ├─ Jane Doe, 52F                 │
│   ├─ Symptoms: Difficulty breathing│
│   ├─ Risk Score: 72/100            │
│   ├─ Risk Level: HIGH              │
│   ├─ Vital: BP 155/95, HR 98      │
│   └─ [View & Start]                │
│                                     │
│   [More patients...]               │
└─────────────────────────────────────┘
  ↓ Click "View & Start" on a patient
┌─────────────────────────────────────┐
│   APPOINTMENT INTERFACE             │
│   (/doctor/appointment/[id])        │
│                                     │
│   LEFT PANEL:                       │
│   ┌────────────────────────────┐    │
│   │ PATIENT INFORMATION        │    │
│   ├────────────────────────────┤    │
│   │ Name: John Smith           │    │
│   │ Age: 45                    │    │
│   │ Gender: Male               │    │
│   │ Email: john@example.com    │    │
│   │                            │    │
│   │ VITAL SIGNS                │    │
│   │ BP: 180/120                │    │
│   │ HR: 110                    │    │
│   │ Temp: 37.8°C               │    │
│   │                            │    │
│   │ REPORTED SYMPTOMS          │    │
│   │ • Chest pain               │    │
│   │ • Shortness of breath      │    │
│   │ • Dizziness                │    │
│   │                            │    │
│   │ VOICE ASSESSMENT           │    │
│   │ Risk Score: 85/100         │    │
│   │ Risk Level: CRITICAL       │    │
│   │                            │    │
│   │ [View Full Assessment]     │    │
│   └────────────────────────────┘    │
│                                     │
│   CENTER/RIGHT PANEL:               │
│   ┌────────────────────────────┐    │
│   │   DIGITAL WHITEBOARD       │    │
│   │                            │    │
│   │  ┌──────────────────────┐  │    │
│   │  │                      │  │    │
│   │  │    [Drawing Area]    │  │    │
│   │  │                      │  │    │
│   │  │    Doctor draws      │  │    │
│   │  │    notes freely      │  │    │
│   │  │                      │  │    │
│   │  └──────────────────────┘  │    │
│   │                            │    │
│   │  [Clear] [Undo]            │    │
│   │  [Transcribe with AI]      │    │
│   └────────────────────────────┘    │
│                                     │
│   BOTTOM PANEL:                     │
│   ┌────────────────────────────┐    │
│   │ PRESCRIPTION                │    │
│   │ [Medicine] [Dosage] [Qty]   │    │
│   │ [Add More] [Remove]         │    │
│   │                            │    │
│   │ NOTES                      │    │
│   │ [Text area for notes]      │    │
│   │                            │    │
│   │ [Complete Appointment]     │    │
│   │ [Mark as No-Show]          │    │
│   │ [Reschedule]               │    │
│   └────────────────────────────┘    │
└─────────────────────────────────────┘
  ↓ Doctor draws notes on whiteboard
┌─────────────────────────────────────┐
│   WHITEBOARD NOTES WRITTEN          │
│                                     │
│   [Image of drawn notes on canvas]  │
│   - Sketched heart diagram          │
│   - Written observations            │
│   - Marked areas of concern         │
└─────────────────────────────────────┘
  ↓ Click "Transcribe with AI"
┌─────────────────────────────────────┐
│   AI TRANSCRIPTION (Gemini Vision)  │
│                                     │
│   Processing...                     │
│   □ □ □ □ □ [50%]                  │
│                                     │
│   Converting whiteboard to text...  │
└─────────────────────────────────────┘
  ↓ Transcription complete
┌─────────────────────────────────────┐
│   TRANSCRIBED NOTES                 │
│                                     │
│   ✓ Transcription Complete!         │
│                                     │
│   Extracted Text:                   │
│   "Patient presents with chest      │
│   pain radiating to left arm.       │
│   ECG shows ST elevation in leads   │
│   II and III. Signs consistent      │
│   with acute MI. Recommend          │
│   immediate cardiology consult      │
│   and troponin testing."            │
│                                     │
│   [Accept] [Edit] [Regenerate]     │
└─────────────────────────────────────┘
  ↓ Click "Accept"
┌─────────────────────────────────────┐
│   COMPLETE APPOINTMENT              │
│                                     │
│   Fill in final details:            │
│                                     │
│   ├─ Diagnosis: [dropdown]         │
│   ├─ Prognosis: [text]             │
│   ├─ Prescriptions: [Added]        │
│   ├─ Follow-up: [Date/Time]        │
│   └─ Additional Notes: [text]      │
│                                     │
│   [Complete & Send Email]           │
│   [Save Draft]                      │
│   [Mark as Cancelled]               │
└─────────────────────────────────────┘
  ↓ Click "Complete & Send Email"
┌─────────────────────────────────────┐
│   SENDING EMAIL...                  │
│                                     │
│   Preparing email:                  │
│   • Appointment summary             │
│   • Diagnosis & prognosis           │
│   • Prescriptions                   │
│   • Doctor notes                    │
│   • Whiteboard transcription        │
│   • Follow-up instructions          │
│                                     │
│   Sending to: john@example.com      │
│   Via: Resend                       │
│                                     │
│   Processing...                     │
└─────────────────────────────────────┘
  ↓ Email sent
┌─────────────────────────────────────┐
│   ✓ APPOINTMENT COMPLETE            │
│                                     │
│   Email sent successfully to:       │
│   john@example.com                  │
│                                     │
│   Summary:                          │
│   • Appointment status: Completed   │
│   • Notes: Saved                    │
│   • Email: Delivered                │
│   • Time: 14:45                     │
│                                     │
│   [Back to Queue]                   │
│   [View Next Patient]               │
└─────────────────────────────────────┘
  ↓ Back to Dashboard
┌─────────────────────────────────────┐
│   DASHBOARD UPDATED                 │
│                                     │
│   Completed Appointments: 1         │
│   Remaining in Queue: 5             │
│                                     │
│   Next Patient:                     │
│   Jane Doe [HIGH] 🟠                │
│                                     │
│   [View Next Patient]               │
└─────────────────────────────────────┘
  ↓ Repeat as needed
END

DOCTOR JOURNEY: COMPLETE ✓
```

---

## 🔄 Risk Scoring Flow

```
INPUT DATA:
├─ Patient Symptoms (from voice assessment)
├─ Vital Signs (from biometric entry)
├─ Age (from patient profile)
└─ Medical History (from biometric entry)

  ↓
ALGORITHM PROCESSING:

  Symptom Scoring (40%)
  ├─ Parse symptoms from assessment
  ├─ Identify critical symptoms
  ├─ Calculate severity score
  └─ Output: Symptom score

  Vital Signs Scoring (30%)
  ├─ Check blood pressure
  ├─ Check heart rate
  ├─ Check temperature
  └─ Output: Vitals score

  Age Scoring (15%)
  ├─ Check age group
  ├─ Apply age multiplier
  └─ Output: Age score

  History Scoring (15%)
  ├─ Count chronic conditions
  ├─ Apply history multiplier
  └─ Output: History score

  ↓
CALCULATE TOTAL SCORE:
  Total = (Symptoms × 0.40) +
          (Vitals × 0.30) +
          (Age × 0.15) +
          (History × 0.15)

  ↓
DETERMINE RISK LEVEL:
  0-39   → LOW (Green 🟢)
  40-59  → MEDIUM (Yellow 🟡)
  60-79  → HIGH (Orange 🟠)
  80-100 → CRITICAL (Red 🔴)

  ↓
ASSIGN SPECIALTY:
  IF symptoms match Cardiology keywords
    → Specialty: Cardiology
  ELSE IF symptoms match Neurology keywords
    → Specialty: Neurology
  [... continue for all specialties ...]
  ELSE
    → Specialty: General Practice

  ↓
OUTPUT RESULTS:
├─ Risk Score: 0-100
├─ Risk Level: LOW/MEDIUM/HIGH/CRITICAL
├─ Recommended Specialty: [Specialty]
├─ Key Risk Factors: [List]
└─ Confidence: [Percentage]
```

---

## 📊 Accessibility Feature Flow

```
USER CLICKS "A" BUTTON (bottom right)

  ↓
┌────────────────────────────────────┐
│  ACCESSIBILITY PANEL OPENS         │
├────────────────────────────────────┤
│                                    │
│  1. FONT SELECTION                 │
│     ⚪ Standard (Geist)            │
│     ⚪ Dyslexia-Friendly           │
│          (OpenDyslexic)            │
│                                    │
│  2. CONTRAST MODE                  │
│     ⚪ Normal                       │
│     ⚪ High Contrast               │
│                                    │
│  3. MOTION SETTINGS                │
│     ☐ Reduce Motion                │
│        (disables animations)       │
│                                    │
│  4. TEXT SIZE                      │
│     ⚪ 100%                         │
│     ⚪ 125%                         │
│     ⚪ 150%                         │
│                                    │
│  5. SPACING OPTION                 │
│     ⚪ Normal                       │
│     ⚪ Comfortable                  │
│     ⚪ Spacious                     │
│                                    │
│  [Apply Changes]                   │
│  [Reset to Default]                │
└────────────────────────────────────┘

  ↓ User selects options
  ↓ Click "Apply Changes"

SETTINGS APPLIED:
├─ Font updated globally
├─ Colors/contrast adjusted
├─ Motion effects toggled
├─ Text sizes rescaled
├─ Spacing increased
└─ Settings saved to localStorage

  ↓
ALL PAGES UPDATE:
└─ All components respect preferences
   across entire application

EXAMPLE: Dyslexia-Friendly Mode Active
├─ OpenDyslexic font applied
├─ Increased letter spacing
├─ Better word differentiation
├─ Reduced visual crowding
└─ Enhanced readability for dyslexic users
```

---

## 📧 Email Delivery Flow

```
TRIGGER: Doctor completes appointment

  ↓
┌────────────────────────────────────┐
│  COLLECT DATA FOR EMAIL            │
├────────────────────────────────────┤
│ • Patient email address            │
│ • Patient name                     │
│ • Doctor name                      │
│ • Appointment date/time            │
│ • Diagnosis                        │
│ • Prescriptions                    │
│ • Doctor notes                     │
│ • Whiteboard image (if drawn)      │
│ • Transcribed notes                │
│ • Follow-up instructions           │
└────────────────────────────────────┘

  ↓ Data collected

┌────────────────────────────────────┐
│  CALL /api/send-prescription-email │
├────────────────────────────────────┤
│ POST request with:                 │
│ • appointmentId                    │
│ • patientEmail                     │
│ • patientName                      │
│ • doctorName                       │
│ • prescription (JSON)              │
│ • notes (text)                     │
│ • whiteboardImage (base64)         │
└────────────────────────────────────┘

  ↓ API processes

┌────────────────────────────────────┐
│  FORMAT EMAIL TEMPLATE             │
├────────────────────────────────────┤
│                                    │
│  Subject:                          │
│  "Your Appointment Summary from    │
│   Dr. [DoctorName]"                │
│                                    │
│  Body HTML:                        │
│  ┌──────────────────────────────┐ │
│  │ Dear [PatientName],          │ │
│  │                              │ │
│  │ APPOINTMENT SUMMARY          │ │
│  │ Date: [Date] [Time]          │ │
│  │ Doctor: Dr. [DoctorName]     │ │
│  │ Specialty: [Specialty]       │ │
│  │                              │ │
│  │ DIAGNOSIS                    │ │
│  │ [Diagnosis text]             │ │
│  │                              │ │
│  │ PRESCRIPTIONS                │ │
│  │ 1. [Medicine] [Dosage]       │ │
│  │ 2. [Medicine] [Dosage]       │ │
│  │                              │ │
│  │ DOCTOR NOTES                 │ │
│  │ [Notes/Whiteboard trans.]    │ │
│  │                              │ │
│  │ [Whiteboard Image]           │ │
│  │ [Image if available]         │ │
│  │                              │ │
│  │ FOLLOW-UP                    │ │
│  │ [Instructions]               │ │
│  │                              │ │
│  │ Best regards,                │ │
│  │ MediAI Healthcare Team       │ │
│  └──────────────────────────────┘ │
└────────────────────────────────────┘

  ↓ Email formatted

┌────────────────────────────────────┐
│  SEND VIA RESEND                   │
├────────────────────────────────────┤
│ Call Resend API:                   │
│ • from: noreply@mediaihealth.com  │
│ • to: patient@example.com          │
│ • subject: [Subject]               │
│ • html: [HTML body]                │
│ • attachments: [if any]            │
└────────────────────────────────────┘

  ↓ Email service processes

┌────────────────────────────────────┐
│  EMAIL DELIVERED ✓                 │
├────────────────────────────────────┤
│ • Email sent successfully          │
│ • Message ID returned              │
│ • Delivery confirmed               │
│ • Patient receives email           │
└────────────────────────────────────┘

  ↓

PATIENT RECEIVES EMAIL:
└─ In inbox
   • Reviews appointment summary
   • Reads prescriptions
   • Views notes
   • Follows up with doctor if needed
```

---

## 🔐 Authentication Flow

```
NEW USER SIGNUP:

START → Home Page
  ↓
User clicks "Sign Up"
  ↓
Choose Role: Patient | Doctor | Admin
  ↓
Enter Email & Password
  ↓
Click "Create Account"
  ↓
┌──────────────────────────────┐
│ Supabase Auth Backend        │
│ • Validate email format      │
│ • Check password strength    │
│ • Hash password (bcrypt)     │
│ • Create user record         │
│ • Generate JWT token         │
│ • Send verification email    │
└──────────────────────────────┘
  ↓
Email Verification Sent
  ↓
User checks email
  ↓
Click verification link
  ↓
Email confirmed ✓
  ↓
Redirect to setup
  ↓
Complete role-specific setup
  ↓
✓ ACCOUNT CREATED

────────────────────────────────

EXISTING USER LOGIN:

START → Home Page
  ↓
User clicks "Sign In"
  ↓
Enter Email
  ↓
Enter Password
  ↓
Click "Sign In"
  ↓
┌──────────────────────────────┐
│ Supabase Auth Backend        │
│ • Look up user by email      │
│ • Verify password (bcrypt)   │
│ • Generate JWT token         │
│ • Set secure session cookie  │
│ • Redirect to role dashboard │
└──────────────────────────────┘
  ↓
Session Created ✓
  ↓
Redirect to appropriate dashboard:
  Patient → /patient/dashboard
  Doctor → /doctor/dashboard
  Admin → /admin/dashboard
  ↓
✓ LOGGED IN
```

---

## 🎯 Summary

All flows are designed for:
- **Intuitive Navigation**: Clear step-by-step processes
- **Error Handling**: Graceful error messages
- **User Feedback**: Status updates at each step
- **Mobile Responsive**: Works on all devices
- **Accessibility**: Keyboard navigation support

---

**Last Updated**: March 13, 2024
**Status**: Complete ✅
