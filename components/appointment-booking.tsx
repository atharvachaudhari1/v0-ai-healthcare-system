'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { useRouter } from 'next/navigation'

interface Doctor {
  id: string
  full_name: string
  specialties: string[]
  bio: string
  rating: number
}

interface Slot {
  id: string
  doctor_id: string
  date: string
  time: string
  is_available: boolean
}

interface AppointmentBookingProps {
  specialty?: string
  onSuccess?: () => void
}

export function AppointmentBooking({
  specialty,
  onSuccess,
}: AppointmentBookingProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<string>('')
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          router.push('/auth/login')
          return
        }

        // Fetch doctors by specialty
        let query = supabase
          .from('doctor_profiles')
          .select('*')

        if (specialty) {
          query = query.contains('specialties', [specialty])
        }

        const { data, error: queryError } = await query

        if (queryError) throw queryError

        setDoctors(data || [])
        setLoading(false)
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [specialty, router, supabase])

  const handleDoctorSelect = async (doctorId: string) => {
    setSelectedDoctor(doctorId)
    setSelectedSlot('')
    setSelectedDate('')

    try {
      // Fetch available slots for this doctor
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data, error: slotsError } = await supabase
        .from('appointment_slots')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('is_available', true)
        .gte('date', tomorrow.toISOString().split('T')[0])
        .limit(20)

      if (slotsError) throw slotsError

      setSlots(data || [])
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedSlot) {
      setError('Please select a doctor and time slot')
      return
    }

    setBooking(true)
    setError(null)

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error('User not authenticated')

      const slot = slots.find((s) => s.id === selectedSlot)
      if (!slot) throw new Error('Invalid slot selected')

      // Get latest risk assessment
      const { data: assessment, error: assessmentError } = await supabase
        .from('risk_assessments')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (assessmentError && assessmentError.code !== 'PGRST116') {
        throw assessmentError
      }

      // Create appointment
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert([
          {
            patient_id: user.id,
            doctor_id: selectedDoctor,
            appointment_slot_id: selectedSlot,
            scheduled_date: slot.date,
            scheduled_time: slot.time,
            risk_level: assessment?.risk_level || 'medium',
            status: 'scheduled',
          },
        ])

      if (appointmentError) throw appointmentError

      // Mark slot as unavailable
      await supabase
        .from('appointment_slots')
        .update({ is_available: false })
        .eq('id', selectedSlot)

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/patient/appointments')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment')
    } finally {
      setBooking(false)
    }
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
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Doctor Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select a Doctor</CardTitle>
          <CardDescription>
            Choose from available {specialty || 'general'} practitioners
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <button
                  key={doctor.id}
                  onClick={() => handleDoctorSelect(doctor.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedDoctor === doctor.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold">{doctor.full_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {doctor.specialties?.join(', ')}
                  </div>
                  {doctor.rating && (
                    <div className="text-sm mt-1">
                      Rating: {doctor.rating.toFixed(1)}/5.0
                    </div>
                  )}
                </button>
              ))
            ) : (
              <p className="text-muted-foreground">No doctors available for this specialty</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Slot Selection */}
      {selectedDoctor && slots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Appointment Time</CardTitle>
            <CardDescription>
              Available slots for the selected doctor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <FieldLabel htmlFor="slots">Available Times</FieldLabel>
              <select
                id="slots"
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select a time slot</option>
                {slots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {new Date(`${slot.date}T${slot.time}`).toLocaleString(
                      'en-US',
                      {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </option>
                ))}
              </select>
            </FieldGroup>
          </CardContent>
        </Card>
      )}

      {/* Booking Button */}
      {selectedDoctor && (
        <Button
          onClick={handleBookAppointment}
          disabled={!selectedSlot || booking}
          size="lg"
          className="w-full"
        >
          {booking && <Spinner className="mr-2" />}
          {booking ? 'Booking...' : 'Confirm Appointment'}
        </Button>
      )}
    </div>
  )
}
