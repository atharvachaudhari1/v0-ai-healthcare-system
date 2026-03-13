import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyConsultationRecord, serializePayload, type ConsultationPayload } from '@/lib/blockchain'

export async function GET(
  req: NextRequest,
  { params }: { params: { appointmentId: string } }
) {
  try {
    const supabase = await createClient()
    const { appointmentId } = params

    // Fetch anchor record
    const { data: anchor, error } = await supabase
      .from('blockchain_anchors')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('anchored_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !anchor) {
      return NextResponse.json(
        { error: 'No blockchain record found for this appointment', verified: false },
        { status: 404 }
      )
    }

    // Recompute hash from stored snapshot to verify integrity
    let verificationResult = null
    if (anchor.consultation_snapshot) {
      try {
        const snapshot = JSON.parse(anchor.consultation_snapshot)
        const payload: ConsultationPayload = {
          appointmentId: anchor.appointment_id,
          patientId: anchor.patient_id || '',
          doctorId: anchor.doctor_id || '',
          timestamp: anchor.anchored_at,
          transcription: snapshot.transcription || '',
          prescription: snapshot.prescription || '',
          notes: snapshot.notes || '',
          vitals: snapshot.vitals || undefined,
        }
        verificationResult = await verifyConsultationRecord(payload, anchor.payload_hash)
      } catch (verifyErr) {
        console.warn('[blockchain/verify] Could not recompute hash:', verifyErr)
      }
    }

    return NextResponse.json({
      verified: true,
      anchor: {
        recordId: anchor.id,
        appointmentId: anchor.appointment_id,
        payloadHash: anchor.payload_hash,
        txHash: anchor.tx_hash,
        blockNumber: anchor.block_number,
        anchoredAt: anchor.anchored_at,
        network: anchor.network,
        verifyUrl: anchor.verify_url,
        status: anchor.status,
      },
      integrityCheck: verificationResult,
    })
  } catch (err: any) {
    console.error('[blockchain/verify] Error:', err)
    return NextResponse.json(
      { error: err.message || 'Verification failed' },
      { status: 500 }
    )
  }
}
