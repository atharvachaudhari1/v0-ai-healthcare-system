import { createClient } from '@/lib/supabase/server'
import { scoreRisk } from '@/lib/risk-scoring'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { conversationId, transcript, symptoms, severity } = body

    // Get patient biometrics
    const { data: biometrics, error: bioError } = await supabase
      .from('biometrics')
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (bioError) {
      return NextResponse.json(
        { error: 'Could not fetch biometrics' },
        { status: 400 }
      )
    }

    // Save voice conversation
    const { data: conversationData, error: conversationError } = await supabase
      .from('voice_conversations')
      .insert([
        {
          patient_id: user.id,
          conversation_id: conversationId,
          transcript: transcript || '',
          symptoms: symptoms || [],
          severity: severity || 0,
          duration_seconds: 0,
        },
      ])
      .select()
      .single()

    if (conversationError) {
      return NextResponse.json(
        { error: 'Failed to save conversation' },
        { status: 400 }
      )
    }

    // Score the risk
    const assessment = scoreRisk({
      symptoms: symptoms || [],
      severity: severity || 5,
      age: biometrics?.age || 30,
      bloodPressureSystolic: biometrics?.blood_pressure_systolic || 120,
      bloodPressureDiastolic: biometrics?.blood_pressure_diastolic || 80,
      heartRate: biometrics?.heart_rate || 70,
      temperature: biometrics?.temperature || 98.6,
      medicalHistory: biometrics?.medical_history ? [biometrics.medical_history] : [],
    })

    // Save risk assessment
    const { data: riskData, error: riskError } = await supabase
      .from('risk_assessments')
      .insert([
        {
          patient_id: user.id,
          voice_conversation_id: conversationData.id,
          risk_score: assessment.riskScore,
          risk_level: assessment.riskLevel,
          recommended_specialty: assessment.recommendedSpecialty,
          symptoms: symptoms || [],
          risk_factors: assessment.riskFactors,
        },
      ])
      .select()
      .single()

    if (riskError) {
      return NextResponse.json(
        { error: 'Failed to save risk assessment' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      assessment: {
        riskScore: assessment.riskScore,
        riskLevel: assessment.riskLevel,
        recommendedSpecialty: assessment.recommendedSpecialty,
        riskFactors: assessment.riskFactors,
      },
      conversationId: conversationData.id,
    })
  } catch (error: any) {
    console.error('Voice assessment error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
