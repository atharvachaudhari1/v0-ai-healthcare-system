import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface PredictionRequest {
  symptoms: string[]
  painLocation?: string
  duration?: string
  severity?: number
  age?: number
  weight?: number
  height?: number
  medicalHistory?: string[]
}

interface DiseasePrediction {
  disease: string
  probability: number
  severityLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  confidenceScore: number
  riskFactors: string[]
}

// Rule-based fallback prediction system
function getRuleBasedPrediction(request: PredictionRequest): DiseasePrediction {
  let disease = 'General Illness'
  let probability = 0.45
  let severityLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium'
  const riskFactors: string[] = []

  const symptoms = request.symptoms.map(s => s.toLowerCase()).join(' ')
  const location = request.painLocation?.toLowerCase() || ''

  // Chest pain detection
  if (symptoms.includes('chest') || symptoms.includes('chest pain') || location.includes('chest')) {
    disease = 'Acute Coronary Syndrome / Angina'
    probability = 0.82
    severityLevel = request.severity && request.severity > 7 ? 'Critical' : 'High'
    riskFactors.push('Chest pain reported', 'Cardiovascular risk')
    if (request.age && request.age > 50) riskFactors.push('Age > 50')
  }
  // Respiratory symptoms
  else if (symptoms.includes('cough') || symptoms.includes('breathing') || symptoms.includes('shortness')) {
    disease = 'Respiratory Infection / Asthma'
    probability = 0.75
    severityLevel = symptoms.includes('severe') ? 'High' : 'Medium'
    riskFactors.push('Respiratory symptoms detected')
  }
  // Fever and body pain
  else if (symptoms.includes('fever') || symptoms.includes('body pain')) {
    disease = 'Viral Infection / Influenza'
    probability = 0.70
    severityLevel = 'Medium'
    riskFactors.push('Fever reported', 'Body ache reported')
    if (request.duration === 'weeks') riskFactors.push('Prolonged symptoms')
  }
  // Headache
  else if (symptoms.includes('headache') || symptoms.includes('migraine')) {
    disease = 'Migraine / Tension Headache'
    probability = 0.68
    severityLevel = request.severity && request.severity > 7 ? 'High' : 'Medium'
    riskFactors.push('Headache reported')
  }
  // Abdominal pain
  else if (symptoms.includes('stomach') || symptoms.includes('abdominal') || location.includes('abdomen')) {
    disease = 'Gastroenteritis / Ulcer'
    probability = 0.65
    severityLevel = 'Medium'
    riskFactors.push('Abdominal discomfort reported')
  }

  return {
    disease,
    probability,
    severityLevel,
    confidenceScore: Math.round(probability * 100),
    riskFactors
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PredictionRequest = await request.json()

    // Validate request
    if (!body.symptoms || body.symptoms.length === 0) {
      return NextResponse.json(
        { error: 'At least one symptom is required' },
        { status: 400 }
      )
    }

    // Get Supabase client
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get ML prediction (using fallback for now)
    const mlPrediction = getRuleBasedPrediction(body)

    // Get Gemini explanation
    let geminiExplanation: any = null
    const apiKey = process.env.GOOGLE_API_KEY

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        const prompt = `You are a medical AI assistant. Based on the following symptom analysis and machine learning prediction, provide a human-readable explanation.

SYMPTOMS: ${body.symptoms.join(', ')}
LOCATION: ${body.painLocation || 'Not specified'}
DURATION: ${body.duration || 'Not specified'}
SEVERITY (1-10): ${body.severity || 'Not specified'}
AGE: ${body.age || 'Not specified'}
WEIGHT (kg): ${body.weight || 'Not specified'}
HEIGHT (cm): ${body.height || 'Not specified'}

ML PREDICTION:
- Disease: ${mlPrediction.disease}
- Confidence: ${mlPrediction.confidenceScore}%
- Severity: ${mlPrediction.severityLevel}
- Risk Factors: ${mlPrediction.riskFactors.join(', ')}

Please provide:
1. A clear, non-alarming explanation (2-3 sentences) of what the prediction means
2. A list of 3-5 precautions or self-care measures
3. When to consult a doctor
4. Any important disclaimers

Format as JSON with keys: explanation, precautions, doctorConsultation, disclaimer`

        const response = await model.generateContent(prompt)
        const text = response.response.text()
        
        try {
          // Try to parse as JSON
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            geminiExplanation = JSON.parse(jsonMatch[0])
          }
        } catch (e) {
          // Fallback if JSON parsing fails
          geminiExplanation = {
            explanation: text,
            precautions: ['Consult a healthcare professional', 'Monitor your symptoms', 'Rest and stay hydrated'],
            doctorConsultation: 'Consult a doctor if symptoms persist or worsen',
            disclaimer: 'This is an AI-generated assessment and not a medical diagnosis'
          }
        }
      } catch (geminiError) {
        console.error('Gemini error:', geminiError)
        // Fallback explanation
        geminiExplanation = {
          explanation: `The analysis suggests possible ${mlPrediction.disease}. Please consult with a healthcare professional for proper diagnosis.`,
          precautions: [
            'Monitor your symptoms closely',
            'Get adequate rest',
            'Stay hydrated',
            'Avoid self-medication without medical advice'
          ],
          doctorConsultation: `Consult a doctor immediately if symptoms worsen or if severity is ${mlPrediction.severityLevel}`,
          disclaimer: 'This is an AI-generated preliminary assessment and not a medical diagnosis. Always consult qualified healthcare professionals.'
        }
      }
    } else {
      // Fallback if no Gemini API key
      geminiExplanation = {
        explanation: `Based on reported symptoms, the system suggests possible ${mlPrediction.disease}. Professional medical evaluation is recommended.`,
        precautions: ['Rest', 'Monitor symptoms', 'Avoid aggravating factors'],
        doctorConsultation: 'Schedule an appointment with a healthcare provider',
        disclaimer: 'This is an AI assessment tool, not medical advice'
      }
    }

    // Save prediction to database
    const { data: savedPrediction, error: saveError } = await supabase
      .from('disease_predictions')
      .insert({
        patient_id: user.id,
        symptoms: body.symptoms,
        pain_location: body.painLocation,
        duration: body.duration,
        severity: body.severity,
        age: body.age,
        weight: body.weight,
        height: body.height,
        predicted_disease: mlPrediction.disease,
        probability: mlPrediction.probability,
        confidence_score: mlPrediction.confidenceScore,
        severity_level: mlPrediction.severityLevel,
        risk_factors: mlPrediction.riskFactors,
        gemini_explanation: geminiExplanation.explanation,
        precautions: geminiExplanation.precautions,
        doctor_consultation: geminiExplanation.doctorConsultation,
        disclaimer: geminiExplanation.disclaimer
      })
      .select()
      .single()

    if (saveError) {
      console.error('Database save error:', saveError)
      throw saveError
    }

    return NextResponse.json({
      success: true,
      prediction: {
        id: savedPrediction.id,
        disease: mlPrediction.disease,
        probability: mlPrediction.probability,
        confidenceScore: mlPrediction.confidenceScore,
        severityLevel: mlPrediction.severityLevel,
        riskFactors: mlPrediction.riskFactors,
        explanation: geminiExplanation.explanation,
        precautions: geminiExplanation.precautions,
        doctorConsultation: geminiExplanation.doctorConsultation,
        disclaimer: geminiExplanation.disclaimer,
        createdAt: savedPrediction.created_at
      }
    })
  } catch (error) {
    console.error('Prediction API error:', error)
    return NextResponse.json(
      { error: 'Failed to process prediction', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
