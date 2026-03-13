'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PatientBiometricForm } from '@/components/patient-biometric-form'
import { PatientVoiceAssessment } from '@/components/patient-voice-assessment'
import { PatientAppointmentBooking } from '@/components/patient-appointment-booking'
import { AccessibilityPanel } from '@/components/accessibility-panel'
import { useAccessibility } from '@/lib/accessibility-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function PatientDashboard() {
  const router = useRouter()
  const { settings } = useAccessibility()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState<'biometrics' | 'assessment' | 'booking'>('biometrics')
  const [biometricsData, setBiometricsData] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        router.push('/auth/login')
        return
      }

      if (user.user_metadata?.role !== 'patient') {
        router.push(`/${user.user_metadata?.role}/dashboard`)
        return
      }

      setUser(user)

      // Check if biometrics already exist
      const { data: biometrics } = await supabase
        .from('biometrics')
        .select('*')
        .eq('patient_id', user.id)
        .single()

      if (biometrics) {
        setBiometricsData(biometrics)
        setCurrentStep('assessment')
      }

      setLoading(false)
    }

    checkUser()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${settings.largerText ? 'text-4xl' : ''}`}>
              Welcome, {user?.user_metadata?.first_name || 'Patient'}
            </h1>
            <p className="text-muted-foreground mt-2">MediAI Patient Portal</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { id: 'biometrics', label: 'Biometrics' },
              { id: 'assessment', label: 'Voice Assessment' },
              { id: 'booking', label: 'Book Appointment' },
            ].map((step, index) => (
              <div key={step.id} className="flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      currentStep === step.id || (step.id === 'assessment' && biometricsData)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < 2 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        biometricsData ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
                <p className="text-sm font-medium text-center mt-2">{step.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-6">
          {currentStep === 'biometrics' && (
            <PatientBiometricForm
              userId={user?.id}
              onSubmit={(data) => {
                setBiometricsData(data)
                setCurrentStep('assessment')
              }}
            />
          )}

          {currentStep === 'assessment' && biometricsData && (
            <PatientVoiceAssessment
              userId={user?.id}
              biometricsData={biometricsData}
              onComplete={() => setCurrentStep('booking')}
            />
          )}

          {currentStep === 'booking' && (
            <PatientAppointmentBooking userId={user?.id} biometricsData={biometricsData} />
          )}
        </div>
      </div>

      <AccessibilityPanel />
    </div>
  )
}
