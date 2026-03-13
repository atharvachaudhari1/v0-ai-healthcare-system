# AI Disease Predictor Documentation

## Overview

The AI Disease Predictor is a hybrid ML + Gemini AI system that analyzes patient-reported symptoms and provides preliminary health insights with explanations, precautions, and doctor consultation guidance. It integrates seamlessly into the MediAI patient flow and stores all predictions in Supabase for historical tracking.

## Architecture

### 1. Data Flow

```
Patient Input (Symptoms, Demographics)
    ↓
Rule-Based ML Fallback System
    ↓
Gemini AI Explanation Engine
    ↓
Supabase Storage (disease_predictions table)
    ↓
Patient Dashboard UI (Current + History + Comparison)
```

### 2. Components

#### Frontend Components

**`components/disease-predictor.tsx`**
- Multi-step symptom collection form
- Common symptoms grid + custom symptom input
- Pain location and duration selection
- Optional biometric data (age, weight, height, BMI)
- Real-time severity slider
- Step-by-step UI with result display

**`components/prediction-history.tsx`**
- Displays prediction history (up to 20 most recent)
- Click to view detailed prediction
- Shows confidence score, severity level, risk factors
- Formatted dates using date-fns

**`components/prediction-comparison.tsx`**
- Select up to 3 predictions for side-by-side comparison
- Confidence score trend visualization
- Prediction consistency analysis
- Alerts if predictions are inconsistent or consistent

#### Pages

**`app/patient/disease-prediction/page.tsx`**
- Main disease predictor dashboard
- Tabs: New Prediction, History, Compare
- Information cards explaining the system
- Important disclaimer about AI limitations
- Integrated accessibility panel

### 3. API Endpoint

**`POST /api/disease-prediction`**

**Request Body:**
```typescript
{
  symptoms: string[]              // Required: Array of reported symptoms
  painLocation?: string           // Optional: Location of pain/discomfort
  duration?: string               // Optional: Duration of symptoms (Hours/Days/Weeks/Months)
  severity?: number               // Optional: 1-10 scale
  age?: number                    // Optional: Patient age
  weight?: number                 // Optional: Weight in kg
  height?: number                 // Optional: Height in cm
  medicalHistory?: string[]       // Optional: Previous conditions
}
```

**Response:**
```typescript
{
  success: boolean
  prediction: {
    id: string                    // Unique prediction ID
    disease: string               // Predicted disease/condition
    probability: number           // ML model confidence (0-1)
    confidenceScore: number       // Percentage (0-100)
    severityLevel: string         // Low | Medium | High | Critical
    riskFactors: string[]        // Identified risk factors
    explanation: string           // Human-readable explanation from Gemini
    precautions: string[]         // Recommended precautions
    doctorConsultation: string    // When to consult doctor
    disclaimer: string            // Legal/medical disclaimer
    createdAt: string             // ISO timestamp
  }
}
```

## ML Prediction System

### Rule-Based Fallback Implementation

Since we're using a fallback system without a pre-trained model, predictions are made using intelligent pattern matching:

**Symptom Detection:**
- Analyzes symptoms for specific keywords
- Identifies primary condition based on symptom clusters
- Assigns probability based on symptom specificity

**Risk Calculation:**
```
Risk Score Components:
- Symptom Severity: Patient reported severity (1-10)
- Pain Location: Anatomical location context
- Duration: How long symptoms have been present
- Age: Age-related risk factors
- Vitals: Optional biometric data (BMI calculation)
```

**Example Predictions:**

| Symptoms | Location | Duration | Severity | Predicted Disease | Confidence |
|----------|----------|----------|----------|-------------------|------------|
| Chest pain, SOB | Chest | Days | 8 | Acute Coronary Syndrome | 82% |
| Cough, Fever | Lungs | Weeks | 6 | Respiratory Infection | 75% |
| Headache | Head | Hours | 7 | Migraine | 68% |
| Stomach pain | Abdomen | Days | 5 | Gastroenteritis | 65% |

### Feature Engineering

For future ML model integration, the system prepares:

```python
features = {
  'symptom_severity': float,      # 0-10
  'duration_hours': int,          # Converted from duration string
  'age': int,                     # Patient age
  'bmi': float,                   # Calculated from weight/height
  'symptom_flags': dict,          # One-hot encoded symptoms
  'location_encoded': int,        # Categorical pain location
  'vital_abnormality': float,     # Deviation from normal vitals
}
```

## Gemini AI Integration

### Gemini Explanation Engine

When Gemini API key is available (`GOOGLE_API_KEY`), the system:

1. **Sends ML Prediction** to Gemini with full context
2. **Requests Human-Readable Explanation**:
   - Non-alarming 2-3 sentence description
   - Why this condition is likely
   - Connection to reported symptoms

3. **Generates Precautions**:
   - 3-5 practical self-care measures
   - Things to monitor
   - When to escalate care

4. **Doctor Consultation Guidance**:
   - When to schedule appointment
   - Urgency level based on severity
   - Red flags requiring immediate care

5. **Disclaimer**:
   - Legal statement about AI limitations
   - Emphasis on professional medical advice

### Fallback Mechanism

If Gemini API is unavailable or fails:

```typescript
// Static fallback explanation
explanation: "The analysis suggests possible {disease}. 
             Please consult with a healthcare professional 
             for proper diagnosis."

precautions: [
  "Monitor your symptoms closely",
  "Get adequate rest",
  "Stay hydrated",
  "Avoid self-medication without medical advice"
]

doctorConsultation: "Consult a doctor immediately if 
                     symptoms worsen or severity is high"

disclaimer: "This is an AI-generated preliminary assessment 
            and not a medical diagnosis..."
```

## Database Schema

### `disease_predictions` Table

```sql
CREATE TABLE disease_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Input Data
  symptoms TEXT[] NOT NULL,
  pain_location VARCHAR(100),
  duration VARCHAR(50),
  severity INT CHECK (severity BETWEEN 1 AND 10),
  age INT,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  
  -- ML Prediction
  predicted_disease VARCHAR(255) NOT NULL,
  probability DECIMAL(3,2),
  confidence_score INT,
  severity_level VARCHAR(20),
  risk_factors TEXT[],
  
  -- AI Explanation
  gemini_explanation TEXT,
  precautions TEXT[],
  doctor_consultation TEXT,
  disclaimer TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_patient_predictions ON disease_predictions(patient_id, created_at DESC);
CREATE INDEX idx_severity_level ON disease_predictions(patient_id, severity_level);
```

### RLS Policies

```sql
-- Patients can view their own predictions
ALTER TABLE disease_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own predictions"
  ON disease_predictions
  FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create own predictions"
  ON disease_predictions
  FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can view patient predictions"
  ON disease_predictions
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM appointments 
    WHERE appointments.patient_id = disease_predictions.patient_id
    AND appointments.doctor_id = auth.uid()
  ));
```

## Integration with Patient Flow

### Step 4: AI Disease Predictor (After Voice Assessment)

**Timeline:**
1. Patient completes biometric data ✓
2. Patient undergoes voice assessment ✓
3. **[NEW] Patient uses AI Disease Predictor**
4. Patient books appointment

**Access:**
- Direct link in patient dashboard
- Accessible from "AI Disease Predictor" quick action button
- Available at `/patient/disease-prediction`

### Expected Outcomes

The predictor feeds into the doctor appointment system:

```
Disease Prediction
  ├─ Risk Score (used for appointment priority)
  ├─ Recommended Specialty (cardiology, neurology, etc.)
  ├─ Severity Level (influences booking availability)
  └─ Historical Data (available to doctors during appointment)
```

## Security Considerations

### 1. Server-Side Inference
- All ML predictions happen on backend API
- Model files never exposed to client
- Prevents model theft/reverse engineering

### 2. API Key Management
- `GOOGLE_API_KEY` stored in environment variables
- Never exposed in client-side code
- Validated on server before use

### 3. Data Protection
- All predictions tied to authenticated user
- Row-level security enforces patient privacy
- Encrypted transmission (HTTPS)
- Secure deletion on user request

### 4. Input Validation
```typescript
// Required field validation
if (!symptoms || symptoms.length === 0) {
  return error("At least one symptom required")
}

// Type checking
symptoms.forEach(s => {
  if (typeof s !== 'string' || s.length > 500) {
    throw new Error("Invalid symptom format")
  }
})

// Numeric bounds
if (severity && (severity < 1 || severity > 10)) {
  throw new Error("Severity must be 1-10")
}
```

## Testing the System

### Manual Testing

1. **Start Dev Server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Disease Predictor:**
   - Login as patient
   - Go to Dashboard → "AI Disease Predictor" button
   - Or visit: `/patient/disease-prediction`

3. **Test New Prediction:**
   - Select symptoms: "Chest pain", "Shortness of breath"
   - Set pain location: "Chest"
   - Set duration: "Days"
   - Set severity: 8
   - Add age: 55
   - Submit

4. **Expected Result:**
   - Disease: "Acute Coronary Syndrome / Angina"
   - Confidence: 82%
   - Severity: High (or Critical)
   - Gemini explanation appears if API key configured

5. **Test History:**
   - Go to History tab
   - Click on past prediction
   - View detailed analysis

6. **Test Comparison:**
   - Go to Compare tab
   - Select multiple predictions
   - View trend analysis

### Environment Variables Required

```env
# In .env.local
GOOGLE_API_KEY=your_gemini_api_key_here

# Supabase (should already be configured)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Future Enhancements

### 1. ML Model Integration
Replace rule-based system with actual ML model:
```python
# Load pre-trained model
model = joblib.load('risk_prioritization_model.pkl')

# Feature engineering
features = engineer_features(symptoms, demographics)

# Prediction
disease, probability = model.predict(features)
```

### 2. Symptom Ontology
```typescript
const SYMPTOM_RELATIONSHIPS = {
  'chest pain': ['heart', 'lungs', 'stomach', 'anxiety'],
  'shortness of breath': ['lungs', 'heart', 'anxiety'],
  // ... more relationships
}

// Use for better symptom clustering
```

### 3. Temporal Analysis
- Track symptom patterns over time
- Detect progression or regression
- Identify cycles or triggers

### 4. Integration with Appointments
- Auto-populate doctor consultation with prediction
- Show doctor the full prediction history
- Use prediction to suggest specialists

### 5. Analytics Dashboard
- System accuracy tracking
- User demographics
- Most common predictions
- Doctor feedback loop

## Troubleshooting

### Issue: "Failed to get prediction"

**Cause:** Supabase connection error
**Solution:**
```bash
# Check Supabase credentials in .env.local
# Verify NEXT_PUBLIC_SUPABASE_URL and key are correct
# Ensure disease_predictions table exists
```

### Issue: Gemini explanation returns raw text

**Cause:** JSON parsing failed
**Solution:**
- Check API response format
- Verify GOOGLE_API_KEY is valid
- Check for API rate limits

### Issue: Predictions not saving to database

**Cause:** RLS policies blocking insert
**Solution:**
```sql
-- Verify RLS policy allows insert
SELECT * FROM pg_policies 
WHERE tablename = 'disease_predictions';

-- Check user authentication
SELECT auth.uid();
```

## API Examples

### cURL
```bash
curl -X POST http://localhost:3000/api/disease-prediction \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["chest pain", "shortness of breath"],
    "painLocation": "Chest",
    "duration": "Days",
    "severity": 8,
    "age": 55
  }'
```

### JavaScript/Fetch
```typescript
const response = await fetch('/api/disease-prediction', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    symptoms: ['fever', 'cough'],
    painLocation: 'Chest',
    duration: 'Weeks',
    severity: 6
  })
})

const { prediction } = await response.json()
console.log(prediction)
```

### TypeScript SDK
```typescript
import { submitPrediction, DiseasePredictionInput } from '@/lib/disease-prediction'

const input: DiseasePredictionInput = {
  symptoms: ['headache', 'nausea'],
  painLocation: 'Head',
  duration: 'Hours',
  severity: 7,
  age: 35
}

const prediction = await submitPrediction(input)
console.log(`Predicted: ${prediction.disease}`)
console.log(`Confidence: ${prediction.confidenceScore}%`)
```

## Support & Contact

For issues or feature requests related to the AI Disease Predictor:
1. Check this documentation
2. Review error logs in browser console
3. Verify environment variables
4. Contact: support@mediai.example.com
