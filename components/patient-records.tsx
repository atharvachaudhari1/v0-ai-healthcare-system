'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BlockchainBadge } from '@/components/blockchain-badge'
import type { BlockchainAnchor } from '@/lib/blockchain'

interface PatientRecordsProps {
  userId: string
}

interface CompletedRecord {
  appointmentId: string
  date: string
  doctorName: string
  anchor: BlockchainAnchor | null
  verifyUrl: string
}

export function PatientRecords({ userId }: PatientRecordsProps) {
  const [records, setRecords] = useState<CompletedRecord[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        // Fetch completed appointments
        const { data: appointments } = await supabase
          .from('appointments')
          .select('id, created_at, doctor_profiles(full_name)')
          .eq('patient_id', userId)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(10)

        if (!appointments?.length) {
          setLoading(false)
          return
        }

        const appointmentIds = appointments.map((a: any) => a.id)

        // Fetch blockchain anchors for these appointments
        const { data: anchors } = await supabase
          .from('blockchain_anchors')
          .select('*')
          .in('appointment_id', appointmentIds)

        const anchorMap: Record<string, BlockchainAnchor> = {}
        for (const a of (anchors || [])) {
          anchorMap[a.appointment_id] = {
            recordId: a.id,
            appointmentId: a.appointment_id,
            payloadHash: a.payload_hash,
            txHash: a.tx_hash,
            blockNumber: a.block_number,
            anchoredAt: a.anchored_at,
            network: a.network,
            verifyUrl: a.verify_url,
            status: a.status,
          }
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
        const formatted: CompletedRecord[] = appointments.map((a: any) => ({
          appointmentId: a.id,
          date: a.created_at,
          doctorName: a.doctor_profiles?.full_name || 'Doctor',
          anchor: anchorMap[a.id] || null,
          verifyUrl: `${appUrl}/patient/verify-record/${a.id}`,
        }))

        setRecords(formatted)
      } catch (err) {
        console.error('[PatientRecords] fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [userId, supabase])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mx-auto" />
        </CardContent>
      </Card>
    )
  }

  if (!records.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verified Clinical Records</CardTitle>
          <CardDescription>Blockchain-anchored consultation summaries</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your completed consultation records will appear here, anchored to the blockchain for tamper-proof verification.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Verified Clinical Records
        </CardTitle>
        <CardDescription>
          Blockchain-anchored consultation summaries — share with any clinic to prove authenticity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {records.map((record) => (
          <div key={record.appointmentId} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">
                  Consultation with {record.doctorName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(record.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <a
                href={record.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 hover:text-emerald-800 underline shrink-0"
              >
                Verify
              </a>
            </div>

            {record.anchor ? (
              <BlockchainBadge anchor={record.anchor} />
            ) : (
              <div className="rounded-lg border border-dashed border-muted-foreground/30 p-2 text-xs text-muted-foreground text-center">
                Blockchain anchor pending
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
