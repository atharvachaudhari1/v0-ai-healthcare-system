import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  anchorConsultation,
  serializePayload,
  computeHash,
  type ConsultationPayload,
  type BlockchainAnchor,
} from '@/lib/blockchain'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      appointmentId,
      patientId,
      transcription,
      prescription,
      notes,
      vitals,
    } = body

    if (!appointmentId) {
      return NextResponse.json({ error: 'appointmentId is required' }, { status: 400 })
    }

    const payload: ConsultationPayload = {
      appointmentId,
      patientId: patientId || user.id,
      doctorId: user.id,
      timestamp: new Date().toISOString(),
      transcription: transcription || '',
      prescription: prescription || '',
      notes: notes || '',
      vitals: vitals || undefined,
    }

    // Compute hash and anchor
    const anchor = await anchorConsultation(payload)

    // Persist anchor record to Supabase
    // Table: blockchain_anchors (create this in Supabase if needed)
    const { error: dbError } = await supabase
      .from('blockchain_anchors')
      .upsert({
        id: anchor.recordId,
        appointment_id: anchor.appointmentId,
        payload_hash: anchor.payloadHash,
        tx_hash: anchor.txHash,
        block_number: anchor.blockNumber,
        network: anchor.network,
        anchored_at: anchor.anchoredAt,
        verify_url: anchor.verifyUrl,
        status: anchor.status,
        doctor_id: user.id,
        patient_id: patientId || null,
        // Store off-chain consultation data for verification
        consultation_snapshot: JSON.stringify({
          transcription: payload.transcription,
          prescription: payload.prescription,
          notes: payload.notes,
          vitals: payload.vitals,
        }),
      })

    // DB error is non-fatal for demo — we still return the anchor
    if (dbError) {
      console.warn('[blockchain/anchor] DB upsert warning:', dbError.message)
    }

    return NextResponse.json({ anchor })
  } catch (err: any) {
    console.error('[blockchain/anchor] Error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to anchor consultation' },
      { status: 500 }
    )
  }
}
