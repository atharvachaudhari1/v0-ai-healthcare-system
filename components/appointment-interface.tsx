'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, FieldLabel } from '@/components/ui/field'
import { DoctorWhiteboard } from '@/components/doctor-whiteboard'
import { Spinner } from '@/components/ui/spinner'
import { useRouter } from 'next/navigation'
import { BlockchainStatusCard } from '@/components/blockchain-badge'
import type { BlockchainAnchor } from '@/lib/blockchain'

interface PatientData {
  full_name: string
  email: string
  biometrics: {
    age: number
    blood_pressure_systolic: number
    blood_pressure_diastolic: number
    heart_rate: number
    temperature: number
    weight: number
    height: number
    medical_history: string
    allergies: string
    current_medications: string
  }
  risk_assessment: {
    risk_score: number
    risk_level: string
    symptoms: string[]
  }
}

interface AppointmentInterfaceProps {
  appointmentId: string
}

export function AppointmentInterface({ appointmentId }: AppointmentInterfaceProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patientData, setPatientData] = useState<PatientData | null>(null)
  const [prescription, setPrescription] = useState('')
  const [notes, setNotes] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [whiteboardImage, setWhiteboardImage] = useState('')
  const [blockchainAnchor, setBlockchainAnchor] = useState<BlockchainAnchor | null>(null)
  const [isAnchoring, setIsAnchoring] = useState(false)
  const [blockchainError, setBlockchainError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointmentData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          router.push('/auth/login')
          return
        }

        // Fetch appointment and patient data
        const { data: appointment, error: appointmentError } = await supabase
          .from('appointments')
          .select(
            `
            id,
            patient_id,
            patient_profiles(full_name, email),
            risk_assessments(risk_score, risk_level, symptoms),
            biometrics(*)
          `
          )
          .eq('id', appointmentId)
          .single()

        if (appointmentError) throw appointmentError

        if (!appointment) {
          throw new Error('Appointment not found')
        }

        // Format patient data
        const formatted: PatientData = {
          full_name: appointment.patient_profiles?.full_name || 'Patient',
          email: appointment.patient_profiles?.email || '',
          biometrics: appointment.biometrics?.[0] || {},
          risk_assessment: appointment.risk_assessments?.[0] || {
            risk_score: 0,
            risk_level: 'unknown',
            symptoms: [],
          },
        }

        setPatientData(formatted)
        setLoading(false)
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchAppointmentData()
  }, [appointmentId, router, supabase])

  const handleTranscriptionComplete = (
    transcribedText: string,
    imageUrl: string
  ) => {
    setTranscription(transcribedText)
    setWhiteboardImage(imageUrl)
  }

  const handleCompleteAppointment = async () => {
    if (!patientData) return

    setIsSending(true)
    setError(null)
    setBlockchainError(null)

    try {
      // Step 1: Anchor consultation to blockchain
      setIsAnchoring(true)
      const anchorResponse = await fetch('/api/blockchain/anchor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          patientId: null, // server will use auth context
          transcription,
          prescription,
          notes,
          vitals: {
            heartRate: patientData.biometrics?.heart_rate,
            bloodPressure: patientData.biometrics?.blood_pressure_systolic
              ? `${patientData.biometrics.blood_pressure_systolic}/${patientData.biometrics.blood_pressure_diastolic}`
              : undefined,
            temperature: patientData.biometrics?.temperature,
          },
        }),
      })
      if (anchorResponse.ok) {
        const { anchor } = await anchorResponse.json()
        setBlockchainAnchor(anchor)
      } else {
        const err = await anchorResponse.json()
        setBlockchainError(err.error || 'Blockchain anchoring failed (non-fatal)')
      }
      setIsAnchoring(false)

      // Step 2: Send email with prescription and transcription
      const response = await fetch('/api/send-prescription-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          patientEmail: patientData.email,
          patientName: patientData.full_name,
          transcription,
          whiteboardImage,
          prescription,
          notes,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      // Step 3: Update appointment status
      await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', appointmentId)

      router.push('/doctor/dashboard')
    } catch (err: any) {
      setIsAnchoring(false)
      setError(err.message || 'Failed to complete appointment')
    } finally {
      setIsSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner />
      </div>
    )
  }

  if (!patientData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">{error || 'Patient data not found'}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Patient Info */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-semibold">{patientData.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold text-sm">{patientData.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Risk Level</p>
              <p
                className={`font-semibold ${
                  patientData.risk_assessment.risk_level === 'critical'
                    ? 'text-red-600'
                    : patientData.risk_assessment.risk_level === 'high'
                      ? 'text-orange-600'
                      : 'text-yellow-600'
                }`}
              >
                {patientData.risk_assessment.risk_level?.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Risk Score</p>
              <p className="font-semibold">
                {patientData.risk_assessment.risk_score}/100
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs */}
        <Card>
          <CardHeader>
            <CardTitle>Vital Signs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Age:</span>
              <span>{patientData.biometrics.age} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">BP:</span>
              <span>
                {patientData.biometrics.blood_pressure_systolic}/
                {patientData.biometrics.blood_pressure_diastolic} mmHg
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">HR:</span>
              <span>{patientData.biometrics.heart_rate} bpm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Temp:</span>
              <span>{patientData.biometrics.temperature}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">BMI:</span>
              <span>
                {(
                  patientData.biometrics.weight /
                  ((patientData.biometrics.height / 100) ** 2)
                ).toFixed(1)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Symptoms */}
        {patientData.risk_assessment.symptoms?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Reported Symptoms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patientData.risk_assessment.symptoms.map((symptom, idx) => (
                  <div key={idx} className="text-sm">
                    • {symptom}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Whiteboard & Notes */}
      <div className="lg:col-span-2 space-y-4">
        <DoctorWhiteboard
          appointmentId={appointmentId}
          patientName={patientData.full_name}
          onTranscriptionComplete={handleTranscriptionComplete}
        />

        {/* Prescription */}
        <Card>
          <CardHeader>
            <CardTitle>Prescription</CardTitle>
            <CardDescription>Medications and treatment plan</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder="Enter prescription details, medications, dosages, and instructions..."
              className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </CardContent>
        </Card>

        {/* Doctor Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Doctor Notes</CardTitle>
            <CardDescription>Additional observations and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter additional notes, follow-up instructions, and recommendations..."
              className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </CardContent>
        </Card>

        {/* Blockchain Record */}
        <BlockchainStatusCard
          anchor={blockchainAnchor}
          isAnchoring={isAnchoring}
          error={blockchainError}
        />

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Complete Button */}
        <Button
          onClick={handleCompleteAppointment}
          disabled={isSending || isAnchoring}
          size="lg"
          className="w-full"
        >
          {(isSending || isAnchoring) && <Spinner className="mr-2" />}
          {isAnchoring ? 'Anchoring to Blockchain...' : 'Complete Appointment & Send Email'}
        </Button>
      </div>
    </div>
  )
}
