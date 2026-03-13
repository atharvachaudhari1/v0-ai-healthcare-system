import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateRiskScore } from '@/lib/risk-scoring'

// This API route handles audio processing from ElevenLabs
// It will transcribe the audio and assess the patient's symptoms

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audio = formData.get('audio') as Blob
    const userId = formData.get('userId') as string

    if (!audio || !userId) {
      return NextResponse.json(
        { error: 'Missing audio or userId' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get patient's biometrics for risk assessment
    const { data: biometrics, error: bioError } = await supabase
      .from('biometrics')
      .select('*')
      .eq('patient_id', userId)
      .single()

    if (bioError || !biometrics) {
      return NextResponse.json(
        { error: 'Could not retrieve patient biometrics' },
        { status: 400 }
      )
    }

    // TODO: Implement ElevenLabs API call for transcription
    // For now, return mock data structure
    const mockTranscript = 'Patient reports experiencing chest pain for 3 days, moderate severity'
    const mockAssessment = {
      symptoms: 'Chest pain',
      severity: 7,
      duration: '3 days',
      specialty: 'Cardiology',
      risk_score: calculateRiskScore(biometrics, {
        symptom_severity: 7,
        chest_pain: true,
      }),
      notes: 'Patient experiencing chest pain - requires urgent cardiology assessment',
    }

    return NextResponse.json({
      transcript: mockTranscript,
      assessment: mockAssessment,
      success: true,
    })
  } catch (error) {
    console.error('Voice processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process audio' },
      { status: 500 }
    )
  }
}
