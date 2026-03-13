'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AppointmentsListProps {
  patientId: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  specialty: string;
  doctor: {
    id: string;
    first_name: string;
    last_name: string;
  };
  status: string;
  risk_score: number;
}

export default function AppointmentsList({ patientId }: AppointmentsListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const supabase = createClient();

        const { data, error: fetchError } = await supabase
          .from('appointments')
          .select(
            `
            id,
            appointment_date,
            appointment_time,
            specialty,
            status,
            risk_score,
            doctor_profiles (
              id,
              first_name,
              last_name
            )
          `
          )
          .eq('patient_id', patientId)
          .order('appointment_date', { ascending: true });

        if (fetchError) throw fetchError;

        setAppointments(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [patientId]);

  if (loading) {
    return (
      <div className="text-center text-slate-300">
        Loading appointments...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-12 text-center">
          <h3 className="text-xl font-semibold text-white mb-4">No Appointments Yet</h3>
          <p className="text-slate-300 mb-6">
            You haven't scheduled any appointments yet. Complete your biometric assessment to get started.
          </p>
          <Link href="/patient/voice-assessment">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Start Health Assessment
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 hover:bg-white/15 transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {appointment.specialty}
                  </h3>
                  <p className="text-slate-300">
                    Dr. {appointment.doctor?.first_name} {appointment.doctor?.last_name}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    appointment.status === 'scheduled'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {appointment.status}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Date & Time</p>
                  <p className="text-white">
                    {new Date(appointment.appointment_date).toLocaleDateString()} at{' '}
                    {appointment.appointment_time}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Risk Score</p>
                  <p className="text-white">{appointment.risk_score}/100</p>
                </div>
                <div className="text-right">
                  {appointment.status === 'scheduled' && (
                    <Link href={`/patient/appointment/${appointment.id}`}>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        View Details
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
