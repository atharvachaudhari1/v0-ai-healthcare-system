import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * ElevenLabs Voice Agent Integration
 * This endpoint processes voice audio from the ElevenLabs voice agent
 * and returns symptom assessment with risk scoring
 */

const SYSTEM_PROMPT = `You are an AI medical intake specialist conducting an initial patient assessment for MediAI. Your role is to:

1. Greet the patient warmly and professionally
2. Ask about their PRIMARY SYMPTOMS in a conversational manner
3. Assess SYMPTOM SEVERITY on a scale of 1-10
4. Ask about DURATION and PROGRESSION of symptoms  
5. Inquire about ASSOCIATED SYMPTOMS
6. Gather relevant medical information for specialty assignment

IMPORTANT - Red Flag Symptoms (handle with care):
- Chest pain/pressure
- Severe difficulty breathing
- Severe headache with vision changes
- Severe abdominal pain
- Loss of consciousness
- Uncontrolled bleeding

For red flag symptoms, be thorough and recommend emergency services if needed.

At the end of assessment, provide:
SYMPTOMS: [comma-separated list]
SEVERITY: [1-10 scale]
DURATION: [how long patient has had symptoms]
SPECIALTY: [Cardiology/Neurology/Gastroenterology/Pulmonology/Orthopedics/General]
RISK_ASSESSMENT: [Clinical impression and risk factors]`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transcript, userId, appointmentId } = body

    if (!transcript || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: transcript, userId' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get patient biometrics for context-aware assessment
    const { data: biometrics, error: bioError } = await supabase
      .from('biometrics')
      .select('*')
      .eq('patient_id', userId)
      .single()

    if (bioError) {
      console.error('Biometrics fetch error:', bioError)
    }

    // Parse the AI assessment from transcript
    // In production, you would call ElevenLabs API or Claude/GPT to analyze the transcript
    const assessment = parseVoiceAssessment(transcript, biometrics)

    // Save voice conversation record
    const { error: insertError } = await supabase
      .from('voice_conversations')
      .insert([
        {
          patient_id: userId,
          transcript: transcript,
          assessment_data: assessment,
          duration: body.duration || 0,
        },
      ])

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save voice assessment' },
        { status: 500 }
      )
    }

    // Calculate risk score
    const riskScore = calculateRiskFromAssessment(assessment, biometrics)

    // Save risk assessment
    if (appointmentId) {
      await supabase
        .from('risk_assessments')
        .insert([
          {
            appointment_id: appointmentId,
            patient_id: userId,
            risk_score: riskScore,
            risk_level: getRiskLevel(riskScore),
            symptom_summary: assessment.symptoms,
            severity: assessment.severity,
            specialty_recommended: assessment.specialty,
            assessment_data: assessment,
          },
        ])
    }

    return NextResponse.json({
      success: true,
      assessment: {
        symptoms: assessment.symptoms,
        severity: assessment.severity,
        duration: assessment.duration,
        specialty: assessment.specialty,
        risk_score: riskScore,
        risk_level: getRiskLevel(riskScore),
        notes: assessment.notes,
      },
    })
  } catch (error) {
    console.error('Voice processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process voice assessment' },
      { status: 500 }
    )
  }
}

interface BiometricData {
  blood_pressure_systolic: number
  blood_pressure_diastolic: number
  heart_rate: number
  temperature: number
  age: number
}

interface Assessment {
  symptoms: string
  severity: number
  duration: string
  specialty: string
  notes: string
}

function parseVoiceAssessment(transcript: string, biometrics?: any): Assessment {
  // Parse transcript for key information
  // This is a simplified parser - in production use LLM for better results
  
  const lowerTranscript = transcript.toLowerCase()
  
  // Extract severity (look for numbers or severity words)
  let severity = 5
  const severityMatch = lowerTranscript.match(/(\d+)\s*(?:out of|\/)\s*10/)
  if (severityMatch) {
    severity = parseInt(severityMatch[1])
  } else if (lowerTranscript.includes('severe') || lowerTranscript.includes('worst')) {
    severity = 9
  } else if (lowerTranscript.includes('moderate') || lowerTranscript.includes('medium')) {
    severity = 6
  } else if (lowerTranscript.includes('mild') || lowerTranscript.includes('slight')) {
    severity = 3
  }

  // Extract symptoms
  const symptomKeywords = [
    'chest pain',
    'pain',
    'headache',
    'fever',
    'cough',
    'breathing',
    'nausea',
    'vomiting',
    'dizziness',
    'fatigue',
    'weakness',
    'abdominal',
    'stomach',
  ]
  
  const symptoms = symptomKeywords
    .filter((keyword) => lowerTranscript.includes(keyword))
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(', ')

  // Determine specialty
  let specialty = 'General Practice'
  if (lowerTranscript.includes('chest') || lowerTranscript.includes('heart')) {
    specialty = 'Cardiology'
  } else if (lowerTranscript.includes('headache') || lowerTranscript.includes('migraine')) {
    specialty = 'Neurology'
  } else if (lowerTranscript.includes('stomach') || lowerTranscript.includes('abdominal')) {
    specialty = 'Gastroenterology'
  } else if (lowerTranscript.includes('breath') || lowerTranscript.includes('lung')) {
    specialty = 'Pulmonology'
  } else if (lowerTranscript.includes('joint') || lowerTranscript.includes('bone')) {
    specialty = 'Orthopedics'
  }

  // Extract duration
  let duration = 'Unknown'
  if (lowerTranscript.includes('day')) duration = 'Days'
  if (lowerTranscript.includes('week')) duration = 'Weeks'
  if (lowerTranscript.includes('month')) duration = 'Months'

  return {
    symptoms: symptoms || 'Not specified',
    severity: Math.min(10, Math.max(1, severity)),
    duration,
    specialty,
    notes: transcript.substring(0, 200),
  }
}

function calculateRiskFromAssessment(assessment: Assessment, biometrics?: BiometricData): number {
  let score = 0

  // Symptom severity (0-40 points)
  score += assessment.severity * 4

  // Critical symptoms (add extra points)
  const criticalSymptoms = ['chest', 'breathing', 'severe', 'unconscious']
  if (criticalSymptoms.some((s) => assessment.symptoms.toLowerCase().includes(s))) {
    score += 20
  }

  // Vital signs (0-30 points)
  if (biometrics) {
    const bp = biometrics.blood_pressure_systolic
    if (bp > 180) score += 15
    else if (bp > 160) score += 10
    else if (bp > 140) score += 5

    if (biometrics.heart_rate > 120) score += 8
    else if (biometrics.heart_rate > 100) score += 4

    if (biometrics.temperature > 38.5) score += 5
  }

  // Age factor (0-15 points)
  if (biometrics?.age) {
    if (biometrics.age > 75) score += 15
    else if (biometrics.age > 60) score += 8
    else if (biometrics.age > 50) score += 4
  }

  return Math.min(100, Math.max(0, score))
}

function getRiskLevel(score: number): string {
  if (score >= 80) return 'critical'
  if (score >= 60) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}
