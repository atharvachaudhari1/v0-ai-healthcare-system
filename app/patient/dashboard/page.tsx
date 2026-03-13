'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PatientBiometricForm } from '@/components/patient-biometric-form'
import { AccessibilityPanel } from '@/components/accessibility-panel'

export default function PatientDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        router.push('/auth/login')
        return
      }

      // Check if biometrics already exist
      const { data: biometrics } = await supabase
        .from('biometrics')
        .select('*')
        .eq('patient_id', user.id)
        .single()

      if (biometrics) {
        router.push('/patient/voice-assessment')
        return
      }

      setLoading(false)
    }

    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <PatientBiometricForm />
      <AccessibilityPanel />
    </>
  )
}
