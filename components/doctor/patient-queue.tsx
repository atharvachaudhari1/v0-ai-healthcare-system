'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PatientQueueProps {
  doctorId: string;
  doctorUserId: string;
}

interface QueuedPatient {
  id: string;
  patient_id: string;
  appointment_id: string;
  appointment_date: string;
  appointment_time: string;
  risk_score: number;
  risk_level: string;
  specialty: string;
  status: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  risk_assessment: {
    symptoms: string[];
    recommended_specialty: string;
  };
}

export default function PatientQueue({ doctorId, doctorUserId }: PatientQueueProps) {
  const [queue, setQueue] = useState<QueuedPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const supabase = createClient();

        // Fetch appointments for this doctor, sorted by risk and time
        const { data, error: fetchError } = await supabase
          .from('appointments')
          .select(
            `
            id,
            patient_id,
            appointment_date,
            appointment_time,
            risk_score,
            risk_level,
            specialty,
            status,
            users!patient_id (
              id,
              email,
              user_metadata
            ),
            risk_assessments (
              symptoms,
              recommended_specialty
            )
          `
          )
          .eq('doctor_id', doctorId)
          .order('risk_score', { ascending: false })
          .order('appointment_date', { ascending: true });

        if (fetchError) throw fetchError;

        const formattedData = (data || []).map((appt: any) => ({
          id: appt.id,
          patient_id: appt.patient_id,
          appointment_id: appt.id,
          appointment_date: appt.appointment_date,
          appointment_time: appt.appointment_time,
          risk_score: appt.risk_score,
          risk_level: appt.risk_level,
          specialty: appt.specialty,
          status: appt.status,
          patient: {
            id: appt.patient_id,
            first_name: appt.users?.user_metadata?.first_name || 'Unknown',
            last_name: appt.users?.user_metadata?.last_name || 'Patient',
            email: appt.users?.email || '',
          },
          risk_assessment: {
            symptoms: appt.risk_assessments?.[0]?.symptoms || [],
            recommended_specialty: appt.risk_assessments?.[0]?.recommended_specialty || '',
          },
        }));

        setQueue(formattedData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch patient queue');
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
  }, [doctorId]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-400 bg-red-500/20';
      case 'high':
        return 'text-orange-400 bg-orange-500/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20';
      default:
        return 'text-green-400 bg-green-500/20';
    }
  };

  if (loading) {
    return (
      <div className="text-center text-slate-300">
        Loading patient queue...
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

      {queue.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-12 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">No Scheduled Appointments</h3>
          <p className="text-slate-300">
            You don't have any scheduled appointments yet. Set up your available slots to accept patients.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Patient Queue ({queue.length})
            </h2>

            {/* Queue sorted by risk */}
            {queue.map((patient, idx) => (
              <div
                key={patient.appointment_id}
                className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4 last:mb-0"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Patient Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center font-semibold text-blue-400">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {patient.patient.first_name} {patient.patient.last_name}
                        </h3>
                        <p className="text-xs text-slate-400">{patient.patient.email}</p>
                      </div>
                    </div>

                    {/* Risk Badge */}
                    <div className="flex gap-2 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(patient.risk_level)}`}
                      >
                        Risk: {patient.risk_level.toUpperCase()} ({patient.risk_score}/100)
                      </span>
                    </div>

                    {/* Symptoms */}
                    {patient.risk_assessment.symptoms.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-slate-400 mb-1">Symptoms:</p>
                        <div className="flex flex-wrap gap-2">
                          {patient.risk_assessment.symptoms.map((symptom, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-white/10 text-xs text-slate-300 rounded"
                            >
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Appointment Time */}
                    <div className="text-sm text-slate-300">
                      <span className="font-medium">Appointment:</span>{' '}
                      {new Date(patient.appointment_date).toLocaleDateString()} at{' '}
                      {patient.appointment_time}
                    </div>
                  </div>

                  {/* Action */}
                  <Link href={`/doctor/appointment/${patient.appointment_id}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                      View & Treat
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
