'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import DoctorSelection from '@/components/patient/doctor-selection';
import SlotSelection from '@/components/patient/slot-selection';

export default function BookAppointmentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'doctor' | 'slot' | 'confirm'>('doctor');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [riskAssessment, setRiskAssessment] = useState<any>(null);

  useEffect(() => {
    const initializeBooking = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login?role=patient');
        return;
      }

      setUser(user);

      // Fetch latest risk assessment
      const { data: assessment } = await supabase
        .from('risk_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setRiskAssessment(assessment);
      setLoading(false);
    };

    initializeBooking();
  }, [router]);

  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor(doctor);
    setStep('slot');
  };

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot);
    setStep('confirm');
  };

  const handleConfirmBooking = async () => {
    try {
      const supabase = createClient();

      const { error } = await supabase.from('appointments').insert({
        patient_id: user?.id,
        doctor_id: selectedDoctor?.id,
        appointment_date: selectedSlot?.date,
        appointment_time: selectedSlot?.time,
        specialty: riskAssessment?.recommended_specialty,
        status: 'scheduled',
        risk_score: riskAssessment?.risk_score,
        risk_level: riskAssessment?.risk_level,
      });

      if (error) throw error;

      // Send confirmation email
      try {
        const { sendAppointmentReceipt } = await import('@/lib/email');
        await sendAppointmentReceipt(
          user?.email,
          user?.user_metadata?.first_name || 'Patient',
          `${selectedDoctor?.first_name} ${selectedDoctor?.last_name}`,
          `${selectedSlot?.date} at ${selectedSlot?.time}`,
          riskAssessment?.recommended_specialty
        );
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }

      router.push('/patient/dashboard?status=appointment-booked');
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Book Your Appointment</h1>
          {riskAssessment && (
            <div className="flex gap-4 mt-4">
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-slate-400">Recommended Specialty</p>
                <p className="text-lg font-semibold text-white">
                  {riskAssessment.recommended_specialty}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-slate-400">Risk Level</p>
                <p
                  className={`text-lg font-semibold ${
                    riskAssessment.risk_level === 'critical'
                      ? 'text-red-400'
                      : riskAssessment.risk_level === 'high'
                        ? 'text-orange-400'
                        : 'text-green-400'
                  }`}
                >
                  {riskAssessment.risk_level.toUpperCase()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2 mb-8">
          {['doctor', 'slot', 'confirm'].map((s, idx) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  ['doctor', 'slot', 'confirm'].indexOf(step) >= idx
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-slate-400'
                }`}
              >
                {idx + 1}
              </div>
              {idx < 2 && <div className="w-8 h-0.5 bg-white/10 mx-1" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div>
          {step === 'doctor' && (
            <DoctorSelection
              specialty={riskAssessment?.recommended_specialty}
              onSelect={handleDoctorSelect}
            />
          )}

          {step === 'slot' && selectedDoctor && (
            <SlotSelection
              doctorId={selectedDoctor.id}
              onSelect={handleSlotSelect}
              onBack={() => {
                setSelectedDoctor(null);
                setStep('doctor');
              }}
            />
          )}

          {step === 'confirm' && selectedDoctor && selectedSlot && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Confirm Appointment</h2>

              <div className="space-y-6">
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="font-semibold text-white mb-4">Doctor Information</h3>
                  <div className="space-y-2 text-slate-300">
                    <p>
                      <span className="text-white font-medium">Name:</span> Dr.{' '}
                      {selectedDoctor?.first_name} {selectedDoctor?.last_name}
                    </p>
                    <p>
                      <span className="text-white font-medium">Specialization:</span>{' '}
                      {selectedDoctor?.specialization}
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="font-semibold text-white mb-4">Appointment Details</h3>
                  <div className="space-y-2 text-slate-300">
                    <p>
                      <span className="text-white font-medium">Date:</span> {selectedSlot?.date}
                    </p>
                    <p>
                      <span className="text-white font-medium">Time:</span> {selectedSlot?.time}
                    </p>
                    <p>
                      <span className="text-white font-medium">Specialty:</span>{' '}
                      {riskAssessment?.recommended_specialty}
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="font-semibold text-white mb-4">Health Assessment Summary</h3>
                  <div className="space-y-2 text-slate-300">
                    <p>
                      <span className="text-white font-medium">Risk Score:</span>{' '}
                      {riskAssessment?.risk_score}/100
                    </p>
                    <p>
                      <span className="text-white font-medium">Risk Level:</span>{' '}
                      {riskAssessment?.risk_level.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      setSelectedSlot(null);
                      setStep('slot');
                    }}
                    variant="outline"
                    className="flex-1 text-white border-white/20 hover:bg-white/10"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleConfirmBooking}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Confirm Appointment
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
