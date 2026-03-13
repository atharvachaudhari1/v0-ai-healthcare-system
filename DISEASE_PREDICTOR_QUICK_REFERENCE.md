# AI Disease Predictor - Quick Reference Guide

## 🚀 Quick Start

### 1. Database Setup (Already Done ✅)
```bash
# Migration already executed
# Table: disease_predictions
# Table: disease_reference
```

### 2. Environment Configuration
```env
# Add to .env.local
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 3. Run Application
```bash
npm run dev
# Visit http://localhost:3000
```

### 4. Test the Feature
1. Login as patient: `/auth/login`
2. Click "AI Disease Predictor" on dashboard
3. Select symptoms → Fill details → Get prediction

## 📁 Key Files

| File | Purpose | Lines |
|------|---------|-------|
| `/app/api/disease-prediction/route.ts` | API endpoint with ML & Gemini | 237 |
| `/components/disease-predictor.tsx` | Symptom input UI | 434 |
| `/components/prediction-history.tsx` | Historical view | 227 |
| `/components/prediction-comparison.tsx` | Comparison view | 230 |
| `/app/patient/disease-prediction/page.tsx` | Main page | 182 |
| `/lib/disease-prediction.ts` | Utilities & types | 116 |
| `/DISEASE_PREDICTOR.md` | Full documentation | 501 |

## 🔌 API Usage

### Make a Prediction
```typescript
import { submitPrediction } from '@/lib/disease-prediction'

const result = await submitPrediction({
  symptoms: ['chest pain', 'shortness of breath'],
  painLocation: 'Chest',
  duration: 'Days',
  severity: 8,
  age: 55
})

console.log(result.disease)  // "Acute Coronary Syndrome / Angina"
console.log(result.confidenceScore)  // 82
```

### API Endpoint
```bash
curl -X POST http://localhost:3000/api/disease-prediction \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["fever", "cough"],
    "painLocation": "Chest",
    "duration": "Weeks",
    "severity": 6
  }'
```

## 📊 Data Types

### Input
```typescript
interface DiseasePredictionInput {
  symptoms: string[]              // Required
  painLocation?: string           // "Chest", "Head", etc.
  duration?: string               // "Hours", "Days", "Weeks", "Months"
  severity?: number               // 1-10
  age?: number                    // Years
  weight?: number                 // kg
  height?: number                 // cm
  medicalHistory?: string[]       // Previous conditions
}
```

### Output
```typescript
interface DiseasePredictionOutput {
  id: string
  disease: string
  probability: number             // 0-1
  confidenceScore: number         // 0-100
  severityLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  riskFactors: string[]
  explanation: string
  precautions: string[]
  doctorConsultation: string
  disclaimer: string
  createdAt: string
}
```

## 🎨 UI Components

### Import & Use
```typescript
import { DiseasePredictor } from '@/components/disease-predictor'
import { PredictionHistory } from '@/components/prediction-history'
import { PredictionComparison } from '@/components/prediction-comparison'

// In your component
<DiseasePredictor 
  onPredictionComplete={(pred) => console.log(pred)} 
/>

<PredictionHistory userId={user.id} />

<PredictionComparison userId={user.id} />
```

## 🛠️ Utility Functions

```typescript
import {
  submitPrediction,
  getSeverityColor,
  getSeverityLabel,
  calculateBMI,
  getBMICategory,
  COMMON_SYMPTOMS,
  PAIN_LOCATIONS,
  DURATION_OPTIONS,
  SEVERITY_COLORS
} from '@/lib/disease-prediction'

// Examples
getSeverityColor('High')           // Returns '#ef4444' (red)
getSeverityLabel('Critical')       // Returns 'Critical - Seek Immediate Care'
calculateBMI(75, 180)              // Returns 23.1
getBMICategory(23.1)               // Returns 'Normal'
```

## 📈 Database Queries

### Get Patient's Predictions
```sql
SELECT * FROM disease_predictions
WHERE patient_id = 'user-uuid'
ORDER BY created_at DESC
LIMIT 20;
```

### Get High-Risk Predictions
```sql
SELECT * FROM disease_predictions
WHERE patient_id = 'user-uuid'
AND severity_level IN ('High', 'Critical')
ORDER BY created_at DESC;
```

### Get Prediction Statistics
```sql
SELECT 
  severity_level,
  COUNT(*) as count,
  AVG(confidence_score) as avg_confidence
FROM disease_predictions
WHERE patient_id = 'user-uuid'
GROUP BY severity_level;
```

## 🔍 Common Symptoms
```
Fever, Cough, Sore Throat, Headache, Body Ache,
Chest Pain, Shortness of Breath, Dizziness, Nausea,
Vomiting, Diarrhea, Abdominal Pain, Fatigue,
Loss of Appetite, Chills
```

## 🎯 Prediction Routing

| Input | Expected Disease | Confidence |
|-------|------------------|-----------|
| Chest pain + SOB | Acute Coronary Syndrome | 82% |
| Cough + Fever | Respiratory Infection | 75% |
| Headache + Nausea | Migraine | 68% |
| Stomach pain | Gastroenteritis | 65% |
| Joint pain | Arthritis | 60% |

## ⚠️ Error Handling

### API Errors
```typescript
try {
  const prediction = await submitPrediction(input)
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message)
    // "At least one symptom is required"
    // "Failed to get prediction"
    // "Unauthorized"
  }
}
```

### Graceful Degradation
- If Gemini unavailable → Static fallback explanation
- If database fails → Error response with details
- If ML model fails → Rule-based fallback

## 🔐 Security Checklist

- ✅ Server-side inference only
- ✅ API keys in environment variables
- ✅ Authentication enforced
- ✅ RLS policies on database
- ✅ Input validation on all fields
- ✅ No model files exposed to client

## 📝 Testing Scenarios

### Test 1: Cardiac Emergency
```
Symptoms: [Chest pain, Shortness of breath]
Location: Chest | Duration: Days | Severity: 9 | Age: 65
Expected: High confidence, Critical severity, Immediate care guidance
```

### Test 2: Common Cold
```
Symptoms: [Cough, Sore throat]
Location: Throat | Duration: Days | Severity: 3
Expected: Lower confidence, Low-Medium severity, Monitor symptoms
```

### Test 3: History Tracking
```
1. Submit 3 different predictions over time
2. Go to History tab
3. Click each one to view details
4. Verify dates and confidence scores are accurate
```

### Test 4: Comparison View
```
1. Have at least 3 predictions in history
2. Go to Compare tab
3. Select 2-3 predictions
4. Verify trend chart shows confidence progression
5. Check consistency analysis
```

## 🚨 Troubleshooting

### Prediction Not Saving
```
Check: 
1. Supabase RLS policies
2. User authentication status
3. Database connection
4. Patient ID matches auth.uid()
```

### Gemini Not Generating Explanation
```
Check:
1. GOOGLE_API_KEY is set
2. API key is valid
3. API quota not exceeded
4. Network connection
```

### History Not Loading
```
Check:
1. User has permissions
2. Table has data
3. Indexes are created
4. No database errors
```

## 📚 Documentation Map

| Document | Content | Length |
|----------|---------|--------|
| DISEASE_PREDICTOR.md | Complete technical docs | 501 lines |
| DISEASE_PREDICTOR_SUMMARY.md | Implementation summary | 412 lines |
| This file | Quick reference | ~250 lines |
| README.md | Feature overview | ~15 lines |

## 🔗 Related Features

- **Patient Dashboard**: `/patient/dashboard` - Access to disease predictor
- **Voice Assessment**: `/patient/voice-assessment` - Complementary AI feature
- **Appointment Booking**: `/patient/book-appointment` - Uses risk scores
- **Doctor Dashboard**: `/doctor/dashboard` - Views patient predictions

## 💡 Pro Tips

1. **For Testing**: Use extreme values (severity 10, age 90) for edge cases
2. **For Customization**: Modify COMMON_SYMPTOMS in `lib/disease-prediction.ts`
3. **For Performance**: Add Redis caching for frequent predictions
4. **For Analytics**: Track prediction accuracy against actual diagnoses
5. **For Accessibility**: All components support high contrast and larger text

## 📞 Support

For issues:
1. Check DISEASE_PREDICTOR.md troubleshooting section
2. Review API response error messages
3. Check browser console for client errors
4. Check Supabase logs for server errors

---

**Last Updated**: 2024-03-13
**Status**: Production Ready ✅
**Test Coverage**: Manual testing scenarios provided
