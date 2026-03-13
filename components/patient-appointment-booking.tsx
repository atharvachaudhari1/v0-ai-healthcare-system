'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Calendar, Clock, User } from 'lucide-react'

interface PatientAppointmentBookingProps {
  userId: string
  biometricsData: any
}

export function PatientAppointmentBooking({
  userId,
  biometricsData,
}: PatientAppointmentBookingProps) {
  const [doctors, setDoctors] = useState<any[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<string>('')
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    if (selectedDoctor) {
      fetchSlots(selectedDoctor)
    }
  }, [selectedDoctor])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const { data: doctorData, error } = await supabase
        .from('users')
        .select('id, user_metadata->first_name, user_metadata->last_name')
        .eq('user_metadata->role', 'doctor')

      if (error) throw error
      setDoctors(doctorData || [])
    } catch (error: any) {
      toast.error('Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  const fetchSlots = async (doctorId: string) => {
    try {
      const { data: slotData, error } = await supabase
        .from('appointment_slots')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('is_available', true)
        .gt('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })

      if (error) throw error
      setSlots(slotData || [])
    } catch (error: any) {
      toast.error('Failed to load available slots')
    }
  }

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedSlot) {
      toast.error('Please select a doctor and time slot')
      return
    }

    setBooking(true)
    try {
      const slot = slots.find((s) => s.id === selectedSlot)

      const { error } = await supabase
        .from('appointments')
        .insert([
          {
            patient_id: userId,
            doctor_id: selectedDoctor,
            slot_id: selectedSlot,
            start_time: slot.start_time,
            end_time: slot.end_time,
            status: 'scheduled',
          },
        ])

      if (error) throw error

      // Update slot availability
      await supabase
        .from('appointment_slots')
        .update({ is_available: false })
        .eq('id', selectedSlot)

      toast.success('Appointment booked successfully!')
      setSelectedSlot('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to book appointment')
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <Spinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Your Appointment</CardTitle>
        <CardDescription>
          Select a doctor and available time slot for your consultation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Doctor Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">Select a Doctor:</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {doctors.map((doctor) => (
              <button
                key={doctor.id}
                onClick={() => setSelectedDoctor(doctor.id)}
                className={`p-4 text-left border rounded-lg transition-all ${
                  selectedDoctor === doctor.id
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">
                    Dr. {doctor.user_metadata?.first_name} {doctor.user_metadata?.last_name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Slot Selection */}
        {selectedDoctor && (
          <div>
            <label className="block text-sm font-medium mb-3">Select a Time Slot:</label>
            {slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No available slots. Please try another doctor or check back later.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`p-4 text-left border rounded-lg transition-all ${
                      selectedSlot === slot.id
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">
                        {new Date(slot.start_time).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(slot.start_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      -{' '}
                      {new Date(slot.end_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Booking Summary */}
        {selectedDoctor && selectedSlot && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium mb-2">Appointment Summary:</p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>
                Doctor:{' '}
                <span className="font-medium">
                  Dr. {doctors.find((d) => d.id === selectedDoctor)?.user_metadata?.first_name}
                </span>
              </li>
              <li>
                Date & Time:{' '}
                <span className="font-medium">
                  {new Date(
                    slots.find((s) => s.id === selectedSlot)?.start_time
                  ).toLocaleString()}
                </span>
              </li>
            </ul>
          </div>
        )}

        <Button
          onClick={handleBooking}
          disabled={!selectedDoctor || !selectedSlot || booking}
          className="w-full"
        >
          {booking && <Spinner className="mr-2" />}
          {booking ? 'Booking...' : 'Confirm Appointment'}
        </Button>
      </CardContent>
    </Card>
  )
}
