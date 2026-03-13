'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DoctorDashboard } from '@/components/doctor-dashboard'
import { AccessibilityPanel } from '@/components/accessibility-panel'

export default function DoctorDashboardPage() {
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

      const userRole = user.user_metadata?.role
      if (userRole !== 'doctor') {
        router.push('/')
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
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <DoctorDashboard />
        </div>
      </div>
      <AccessibilityPanel />
    </>
  )
}
