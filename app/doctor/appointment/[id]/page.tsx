'use client'

import { AppointmentInterface } from '@/components/appointment-interface'
import { AccessibilityPanel } from '@/components/accessibility-panel'

export default function AppointmentPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <AppointmentInterface appointmentId={params.id} />
        </div>
      </div>
      <AccessibilityPanel />
    </>
  )
}
