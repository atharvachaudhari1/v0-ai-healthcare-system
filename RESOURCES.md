# MediAI - Resources & Setup Checklist

Complete list of resources and accounts needed to run MediAI.

## 📋 Pre-Deployment Checklist

### Development Environment
- [ ] Node.js v18+ installed
- [ ] npm or pnpm installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

### GitHub Account
- [ ] GitHub account created
- [ ] Repository forked/created
- [ ] Ready to push code

## 🔑 Required Services & API Keys

### 1. Supabase (Database & Auth)
**Purpose**: PostgreSQL database + authentication
**Sign Up**: https://supabase.com

**Setup Steps**:
1. Create account
2. Create new project
3. Go to Settings → API
4. Copy `Project URL`
5. Copy `anon public key`
6. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

**Database Tables** (auto-created or via migrations):
- users
- patient_profiles
- biometrics
- doctor_profiles
- voice_conversations
- risk_assessments
- appointment_slots
- appointments
- medical_records

---

### 2. ElevenLabs (Voice Assessment)
**Purpose**: AI voice agent for medical intake
**Sign Up**: https://elevenlabs.io

**Setup Steps**:
1. Create account
2. Go to API section
3. Copy API key
4. Create/configure medical assessment agent
5. Copy Agent ID
6. Add to `.env.local`:
   ```
   NEXT_PUBLIC_ELEVENLABS_API_KEY=your_key
   NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id
   ```

**Configuration**:
- Agent type: Voice conversation
- Language: English
- System prompt: Medical assessment focus
- Response mode: Real-time streaming

**Recommended Agent Settings**:
```
Name: Medical Intake Specialist
Language: English
Stability: 0.5
Similarity Boost: 0.75
Response mode: Real-time
```

---

### 3. Google Gemini Vision (Whiteboard Transcription)
**Purpose**: AI image analysis for whiteboard notes
**Sign Up**: https://cloud.google.com/vertex-ai/generative-ai/docs/vision/overview

**Setup Steps**:
1. Create Google Cloud project
2. Enable Gemini Vision API
3. Create API key (Restricted to Gemini Vision)
4. Copy API key
5. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_key
   ```

**Permission Required**:
- Gemini Vision API read access
- Allow unrestricted access (for development)

---

### 4. Resend (Email Delivery)
**Purpose**: Send prescription summaries and confirmations
**Sign Up**: https://resend.com

**Setup Steps**:
1. Create account
2. Verify email domain (or use default)
3. Go to API Keys section
4. Create API key
5. Copy API key
6. Add to `.env.local`:
   ```
   RESEND_API_KEY=your_key
   ```

**Email Configuration**:
- From: `noreply@mediaihealth.com` (or your domain)
- Reply-to: Support email
- Sender: MediAI Healthcare

---

### 5. Vercel (Deployment - Optional)
**Purpose**: Host your application
**Sign Up**: https://vercel.com

**Setup Steps**:
1. Create account
2. Connect GitHub
3. Import MediAI repository
4. Add environment variables
5. Deploy

---

## 🛠️ Installation Steps

### Step 1: Clone Repository
```bash
git clone <your-repo-url>
cd mediaihealth
```

### Step 2: Install Dependencies
```bash
npm install
# or
pnpm install
```

### Step 3: Create `.env.local`
```bash
# Create file in project root
touch .env.local
```

### Step 4: Add API Keys
Edit `.env.local` with all keys from above services

### Step 5: Run Development Server
```bash
npm run dev
# Server runs on http://localhost:3000
```

### Step 6: Test the System
- Go to http://localhost:3000
- Sign up as patient
- Complete voice assessment
- Book appointment
- View as doctor

---

## 📚 Documentation Files

### For Quick Start
- **QUICK_START.md** - 5-minute setup guide
- **README.md** - Complete documentation

### For Detailed Setup
- **SETUP.md** - Step-by-step installation
- **RESOURCES.md** - This file

### For Developers
- **IMPLEMENTATION_SUMMARY.md** - Architecture details
- **BUILD_SUMMARY.md** - What was built

---

## 🎯 Setup Cost Analysis

| Service | Tier | Monthly Cost | Notes |
|---------|------|--------------|-------|
| Supabase | Free | $0 | 500k API calls free |
| ElevenLabs | Starter | $0-10 | 10k free characters |
| Google Gemini | Free | $0 | $0.00075 per request |
| Resend | Free | $0 | 100 emails free/day |
| Vercel | Free | $0 | Serverless functions |
| **Total** | | **$0-20/mo** | Free tier sufficient |

---

## 📞 Support Resources

### Official Documentation
- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **ElevenLabs**: https://elevenlabs.io/docs
- **Google Gemini**: https://ai.google.dev/docs
- **Resend**: https://resend.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

### Community Help
- **Stack Overflow**: Tag with service names
- **GitHub Discussions**: Ask in MediAI issues
- **Discord Communities**: Join Next.js, Supabase, etc.

---

## 🔒 Security Checklist

### Before Deployment
- [ ] All API keys are in `.env.local` (not committed)
- [ ] `.env.local` is in `.gitignore`
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS in production
- [ ] Set up CORS properly
- [ ] Validate all user inputs
- [ ] Enable RLS policies in Supabase
- [ ] Set up rate limiting

### API Key Rotation
- Rotate ElevenLabs API keys every 6 months
- Rotate Gemini API keys every 6 months
- Rotate Resend API keys every year
- Update Vercel environment variables

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Code tested locally
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Accessibility tested
- [ ] All flows tested

### Deployment
- [ ] Push to GitHub
- [ ] Connect to Vercel
- [ ] Add environment variables in Vercel
- [ ] Deploy
- [ ] Verify deployment
- [ ] Test in production

### Post-Deployment
- [ ] Monitor error logs
- [ ] Set up monitoring (Sentry optional)
- [ ] Enable analytics
- [ ] Test all features
- [ ] Collect feedback

---

## 💾 Backup & Recovery

### Important Files to Backup
- `.env.local` - API keys
- Database (Supabase handles this)
- Uploaded files (if using storage)

### Recovery Steps
1. Keep `.env.local` in secure location
2. Use Supabase backups
3. Version control with Git
4. Test disaster recovery

---

## 📈 Scaling Resources

### If You Need More Power

**Supabase Upgrade**:
- Starter: $25/month (1GB storage)
- Pro: $50/month (10GB storage)
- Custom: Contact sales

**ElevenLabs Upgrade**:
- Starter: $0-10/month
- Creator: Unlimited characters
- Pro: Custom models

**Google Gemini Pricing**:
- Pay per request
- ~$0.00075 per image for Gemini Vision

**Vercel Upgrade**:
- Pro: $20/month (more compute)
- Enterprise: Custom pricing

---

## 🎓 Learning Path

1. **Week 1**: Setup environment and run locally
2. **Week 2**: Understand code structure
3. **Week 3**: Customize styling and content
4. **Week 4**: Add custom features
5. **Week 5**: Deploy to production

---

## ✅ Final Verification

After setup, verify:
```bash
# Dependencies installed
npm list next react typescript

# Environment variables set
cat .env.local | grep NEXT_PUBLIC

# Database connected
# (Check Supabase dashboard)

# Dev server working
npm run dev
# Visit http://localhost:3000
```

---

## 🎯 Quick Reference URLs

| Service | URL |
|---------|-----|
| Supabase Dashboard | https://app.supabase.com |
| ElevenLabs Dashboard | https://elevenlabs.io/app |
| Google Cloud Console | https://console.cloud.google.com |
| Resend Dashboard | https://dashboard.resend.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| Local App | http://localhost:3000 |

---

## 📞 Emergency Contacts

### Service Status Pages
- Supabase: https://status.supabase.com
- Google Cloud: https://status.cloud.google.com
- Resend: https://status.resend.com
- Vercel: https://www.vercelstatus.com

### Support Channels
- Supabase: Discord & Email
- ElevenLabs: Discord & Support
- Google: Support Portal
- Resend: Email & Support

---

## 🎉 You're Ready!

Once all services are set up:
1. Run `npm run dev`
2. Visit http://localhost:3000
3. Start using MediAI!

For issues, check the troubleshooting section in **SETUP.md**.

---

**Last Updated**: March 13, 2024
**Status**: Ready for Setup ✅
