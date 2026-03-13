import { AppointmentBooking } from '@/components/appointment-booking'
import { AccessibilityPanel } from '@/components/accessibility-panel'

export default function BookAppointmentPage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Book an Appointment</h1>
            <p className="text-muted-foreground mt-1">
              Select a doctor and time that works best for you
            </p>
          </div>
          <AppointmentBooking />
        </div>
      </div>
      <AccessibilityPanel />
    </>
  )
}
