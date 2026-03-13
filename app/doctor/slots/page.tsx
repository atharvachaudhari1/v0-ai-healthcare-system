'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { AccessibilityPanel } from '@/components/accessibility-panel'
import { useAccessibility } from '@/lib/accessibility-context'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

interface Slot {
  id: string
  start_time: string
  end_time: string
  is_available: boolean
}

export default function DoctorSlotsPage() {
  const router = useRouter()
  const { settings } = useAccessibility()
  const [user, setUser] = useState<any>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newSlot, setNewSlot] = useState({ date: '', startTime: '', endTime: '' })

  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || user.user_metadata?.role !== 'doctor') {
          router.push('/auth/login')
          return
        }
        setUser(user)
        await fetchSlots(user.id)
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  const fetchSlots = async (doctorId: string) => {
    try {
      const { data, error } = await supabase
        .from('appointment_slots')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('start_time', { ascending: true })

      if (error) throw error
      setSlots(data || [])
    } catch (error) {
      console.error('Failed to fetch slots:', error)
    }
  }

  const handleCreateSlot = async () => {
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
      toast.error('Please fill all fields')
      return
    }

    setCreating(true)
    try {
      const startDateTime = new Date(`${newSlot.date}T${newSlot.startTime}`)
      const endDateTime = new Date(`${newSlot.date}T${newSlot.endTime}`)

      if (endDateTime <= startDateTime) {
        toast.error('End time must be after start time')
        setCreating(false)
        return
      }

      const { error } = await supabase
        .from('appointment_slots')
        .insert([
          {
            doctor_id: user.id,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            is_available: true,
          },
        ])

      if (error) throw error

      toast.success('Slot created successfully')
      setNewSlot({ date: '', startTime: '', endTime: '' })
      await fetchSlots(user.id)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create slot')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('appointment_slots')
        .delete()
        .eq('id', slotId)

      if (error) throw error

      toast.success('Slot deleted')
      setSlots(slots.filter((s) => s.id !== slotId))
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete slot')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen ${
        settings.highContrast ? 'bg-black text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}
      style={{
        fontSize: settings.largerText ? '18px' : '16px',
        letterSpacing: settings.expandedSpacing ? '0.1em' : '0.02em',
      }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.push('/doctor/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className={`text-3xl font-bold ${settings.largerText ? 'text-4xl' : ''}`}>
            Manage Your Appointment Slots
          </h1>
        </div>

        {/* Create New Slot */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Slot</CardTitle>
            <CardDescription>Add available appointment times</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input
                  type="date"
                  value={newSlot.date}
                  onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <Input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Time</label>
                <Input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleCreateSlot} disabled={creating} className="w-full">
              {creating && <Spinner className="mr-2" />}
              <Plus className="w-4 h-4 mr-2" />
              Add Slot
            </Button>
          </CardContent>
        </Card>

        {/* Existing Slots */}
        <div>
          <h2 className={`text-2xl font-bold mb-4 ${settings.largerText ? 'text-3xl' : ''}`}>
            Your Slots
          </h2>
          {slots.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No slots created yet. Create your first slot above.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {slots.map((slot) => (
                <Card key={slot.id}>
                  <CardContent className="pt-6 flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {new Date(slot.start_time).toLocaleDateString()} at{' '}
                        {new Date(slot.start_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        -{' '}
                        {new Date(slot.end_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: {slot.is_available ? '✓ Available' : '✗ Booked'}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSlot(slot.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AccessibilityPanel />
    </div>
  )
}
