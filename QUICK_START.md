# MediAI Quick Start Guide

Get up and running with MediAI in 5 minutes.

## ⚡ Quick Setup

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Create `.env.local`
```bash
# Copy this and fill in your keys
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_key
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id
NEXT_PUBLIC_GEMINI_API_KEY=your_key
RESEND_API_KEY=your_key
```

### 3. Run Development Server
```bash
npm run dev
```

Visit **http://localhost:3000**

## 🎮 Test the System

### As a Patient
1. Click "Sign Up"
2. Select "Patient" role
3. Create account
4. Enter biometric data
5. Complete voice assessment
6. View risk score
7. Book appointment

### As a Doctor
1. Click "Sign Up"
2. Select "Doctor" role
3. Create account
4. View appointment queue
5. Click "View & Start"
6. Draw notes on whiteboard
7. Click "Transcribe with AI"
8. Complete appointment

## 📍 Key Pages

| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Landing page |
| Sign In | `/auth/login` | Login |
| Sign Up | `/auth/signup` | Register |
| Voice Assessment | `/patient/voice-assessment` | Patient assessment |
| Book Appointment | `/patient/book-appointment` | Schedule visit |
| Doctor Dashboard | `/doctor/dashboard` | View patient queue |
| Appointment | `/doctor/appointment/[id]` | Start appointment |

## 🔧 Environment Variables Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - From Supabase dashboard
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase dashboard
- [ ] `NEXT_PUBLIC_ELEVENLABS_API_KEY` - From ElevenLabs
- [ ] `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` - From ElevenLabs
- [ ] `NEXT_PUBLIC_GEMINI_API_KEY` - From Google Cloud
- [ ] `RESEND_API_KEY` - From Resend dashboard

## 🏗️ Project Structure

```
mediaihealth/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page
│   ├── api/               # API routes
│   ├── auth/              # Auth pages
│   ├── patient/           # Patient pages
│   └── doctor/            # Doctor pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── voice-assessment.tsx
│   ├── doctor-whiteboard.tsx
│   └── appointment-*.tsx
├── lib/                  # Utilities & libraries
│   ├── risk-scoring.ts  # ML algorithm
│   ├── supabase/        # Supabase config
│   └── voice-agent.ts   # ElevenLabs config
├── public/              # Static assets
├── .env.local           # Environment variables
└── package.json         # Dependencies
```

## 🔑 Key Components

### Voice Assessment
```tsx
import { VoiceAssessment } from '@/components/voice-assessment'

<VoiceAssessment />
```

### Doctor Whiteboard
```tsx
import { DoctorWhiteboard } from '@/components/doctor-whiteboard'

<DoctorWhiteboard 
  appointmentId="123"
  patientName="John Doe"
  onTranscriptionComplete={(text, image) => {}}
/>
```

### Appointment Booking
```tsx
import { AppointmentBooking } from '@/components/appointment-booking'

<AppointmentBooking specialty="Cardiology" />
```

## 🚀 Deploy to Vercel

```bash
# 1. Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Go to vercel.com
# 3. Click "New Project"
# 4. Import your GitHub repository
# 5. Add environment variables in settings
# 6. Click "Deploy"
```

## 📞 Troubleshooting

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001
```

### Missing Environment Variables
```bash
# Check which variables are missing
npm run dev
# Look for error messages
```

### Database Connection Error
1. Verify `NEXT_PUBLIC_SUPABASE_URL`
2. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Check Supabase project is active

### Voice Assessment Not Working
1. Verify `NEXT_PUBLIC_ELEVENLABS_API_KEY`
2. Verify `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`
3. Check ElevenLabs account is active

### Whiteboard Transcription Failing
1. Verify `NEXT_PUBLIC_GEMINI_API_KEY`
2. Check Google Cloud project has Gemini API enabled
3. Check API key has correct permissions

### Email Not Sending
1. Verify `RESEND_API_KEY`
2. Check domain is verified in Resend
3. Check patient email address is correct

## 💡 Pro Tips

### Hot Reload
Changes to files automatically reload in the browser.

### Browser DevTools
- Open Chrome DevTools (F12)
- Check Console tab for errors
- Use Network tab to debug API calls
- Use Application tab to check localStorage

### Database Viewing
1. Go to Supabase dashboard
2. Click "SQL Editor"
3. Query your tables

### API Testing
Use Postman or curl to test API endpoints:
```bash
curl -X POST http://localhost:3000/api/voice-assessment \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"123","transcript":"I have chest pain","symptoms":["chest pain"],"severity":8}'
```

## 📚 Documentation

- **Full Setup**: See `SETUP.md`
- **Complete Docs**: See `README.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **API Routes**: Check `/app/api/`
- **Components**: Check `/components/`

## 🎯 Next Steps

1. **Customize Colors**: Edit `/app/globals.css`
2. **Update Branding**: Change logo and colors
3. **Add Features**: Create new components
4. **Test Flows**: Use test accounts
5. **Deploy**: Push to production

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Home page loads
- [ ] Can sign up as patient
- [ ] Can sign up as doctor
- [ ] Can enter biometric data
- [ ] Can start voice assessment
- [ ] Voice assessment completes
- [ ] Risk score is calculated
- [ ] Can book appointment
- [ ] Can view doctor queue
- [ ] Can open appointment
- [ ] Can draw on whiteboard
- [ ] Can transcribe whiteboard
- [ ] Email sending works (optional)

## 🎓 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 🆘 Need Help?

1. **Check Logs**: Look at `npm run dev` output
2. **Read SETUP.md**: Detailed troubleshooting guide
3. **Check Environment Variables**: Verify all are set correctly
4. **Test API Endpoints**: Use Postman or curl
5. **Check Database**: View data in Supabase dashboard

---

**You're all set! Start building amazing healthcare features.** 🚀

Questions? Check the documentation files or review the code comments.
