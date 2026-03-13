'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useRouter } from 'next/navigation'

interface AppointmentWithPatient {
  id: string
  patient_id: string
  scheduled_date: string
  scheduled_time: string
  risk_level: string
  status: string
  patient: {
    full_name: string
    email: string
  }
  risk_assessment: {
    risk_score: number
    symptoms: string[]
  }
}

export function DoctorDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          router.push('/auth/login')
          return
        }

        // Fetch appointments sorted by risk level and date
        const { data, error: queryError } = await supabase
          .from('appointments')
          .select(
            `
            id,
            patient_id,
            scheduled_date,
            scheduled_time,
            risk_level,
            status,
            patient_profiles(full_name, email),
            risk_assessments(risk_score, symptoms)
          `
          )
          .eq('doctor_id', user.id)
          .in('status', ['scheduled', 'in_progress'])
          .order('scheduled_date', { ascending: true })

        if (queryError) throw queryError

        // Sort by risk level (critical first)
        const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        const sorted = (data || []).sort(
          (a, b) =>
            (riskOrder[a.risk_level as keyof typeof riskOrder] || 4) -
            (riskOrder[b.risk_level as keyof typeof riskOrder] || 4)
        )

        setAppointments(sorted)
        setLoading(false)
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [router, supabase])

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'bg-red-500/10 text-red-700 border-red-200'
      case 'high':
        return 'bg-orange-500/10 text-orange-700 border-orange-200'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-green-500/10 text-green-700 border-green-200'
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200'
    }
  }

  const handleStartAppointment = (appointmentId: string) => {
    router.push(`/doctor/appointment/${appointmentId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Appointment Queue</h1>
        <p className="text-muted-foreground mt-1">
          Sorted by risk priority - see who needs you most
        </p>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      {appointments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No appointments scheduled for today
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-start justify-between p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {appointment.patient?.full_name || 'Patient'}
                      </h3>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(
                          appointment.risk_level
                        )}`}
                      >
                        {appointment.risk_level.toUpperCase()}
                      </div>
                      {appointment.risk_assessment?.risk_score && (
                        <div className="text-sm text-muted-foreground">
                          Score: {appointment.risk_assessment.risk_score}/100
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground mb-3">
                      <p>
                        📧 {appointment.patient?.email}
                      </p>
                      <p>
                        🕐 {new Date(
                          `${appointment.scheduled_date}T${appointment.scheduled_time}`
                        ).toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {appointment.risk_assessment?.symptoms &&
                      appointment.risk_assessment.symptoms.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">Symptoms:</p>
                          <div className="flex flex-wrap gap-2">
                            {appointment.risk_assessment.symptoms
                              .slice(0, 3)
                              .map((symptom, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 rounded bg-muted text-sm"
                                >
                                  {symptom}
                                </span>
                              ))}
                            {appointment.risk_assessment.symptoms.length > 3 && (
                              <span className="px-2 py-1 rounded bg-muted text-sm">
                                +{appointment.risk_assessment.symptoms.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  <Button
                    onClick={() => handleStartAppointment(appointment.id)}
                    className="ml-4"
                  >
                    View & Start
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
