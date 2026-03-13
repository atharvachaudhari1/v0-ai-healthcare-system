'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import Whiteboard from '@/components/doctor/whiteboard';
import { sendAppointmentSummary } from '@/lib/email';

interface AppointmentData {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  specialty: string;
  status: string;
  risk_score: number;
  risk_level: string;
  patient: any;
  voice_data: any;
}

export default function AppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [whiteboardImage, setWhiteboardImage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tab, setTab] = useState<'overview' | 'whiteboard' | 'summary'>('overview');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const supabase = createClient();

        const { data, error: fetchError } = await supabase
          .from('appointments')
          .select(
            `
            *,
            users!patient_id (
              id,
              email,
              user_metadata
            ),
            voice_conversations (
              transcript,
              symptoms
            )
          `
          )
          .eq('id', appointmentId)
          .single();

        if (fetchError) throw fetchError;

        setAppointment({
          id: data.id,
          patient_id: data.patient_id,
          appointment_date: data.appointment_date,
          appointment_time: data.appointment_time,
          specialty: data.specialty,
          status: data.status,
          risk_score: data.risk_score,
          risk_level: data.risk_level,
          patient: data.users,
          voice_data: data.voice_conversations?.[0],
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load appointment');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  const handleTranscribe = async (imageData: string) => {
    setIsTranscribing(true);
    setError('');

    try {
      const formData = new FormData();
      const blob = await (await fetch(imageData)).blob();
      formData.append('image', blob, 'whiteboard.png');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result = await response.json();
      setTranscription(result.transcription);
      setWhiteboardImage(imageData);
      setTab('summary');
    } catch (err: any) {
      setError(err.message || 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSaveWhiteboard = (imageData: string) => {
    setWhiteboardImage(imageData);
  };

  const handleCompleteAppointment = async () => {
    if (!appointment) return;

    try {
      setLoading(true);
      const supabase = createClient();

      // Update appointment status
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', appointmentId);

      if (updateError) throw updateError;

      // Send email with transcription and whiteboard
      if (appointment.patient?.email) {
        await sendAppointmentSummary({
          patientEmail: appointment.patient.email,
          patientName: `${appointment.patient.user_metadata?.first_name || ''} ${appointment.patient.user_metadata?.last_name || ''}`.trim(),
          doctorName: 'Doctor', // This should come from doctor profile
          appointmentDate: appointment.appointment_date,
          appointmentTime: appointment.appointment_time,
          specialty: appointment.specialty,
          notes: transcription,
          whiteboardImage,
          transcription,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/doctor/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to complete appointment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading appointment...</div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-red-400">Appointment not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Patient Appointment</h1>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm text-slate-400">Patient</p>
              <p className="text-lg font-semibold text-white">
                {appointment.patient?.user_metadata?.first_name}{' '}
                {appointment.patient?.user_metadata?.last_name}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm text-slate-400">Specialty</p>
              <p className="text-lg font-semibold text-white">{appointment.specialty}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm text-slate-400">Risk Level</p>
              <p
                className={`text-lg font-semibold ${
                  appointment.risk_level === 'critical'
                    ? 'text-red-400'
                    : appointment.risk_level === 'high'
                      ? 'text-orange-400'
                      : 'text-green-400'
                }`}
              >
                {appointment.risk_level.toUpperCase()}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm text-slate-400">Appointment Time</p>
              <p className="text-lg font-semibold text-white">
                {new Date(appointment.appointment_date).toLocaleDateString()} at{' '}
                {appointment.appointment_time}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-white/10">
          {(['overview', 'whiteboard', 'summary'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                tab === t
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
            <p className="text-green-200">Appointment completed! Redirecting...</p>
          </div>
        )}

        {/* Content */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {appointment.voice_data && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Patient Assessment Summary</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-400">Symptoms from Voice Assessment</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {appointment.voice_data.symptoms?.map((symptom: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                  {appointment.voice_data.transcript && (
                    <div>
                      <p className="text-sm text-slate-400">Transcript</p>
                      <p className="text-white mt-2">{appointment.voice_data.transcript}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              onClick={() => setTab('whiteboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Open Whiteboard
            </Button>
          </div>
        )}

        {tab === 'whiteboard' && (
          <Whiteboard onTranscribe={handleTranscribe} onSave={handleSaveWhiteboard} isTranscribing={isTranscribing} />
        )}

        {tab === 'summary' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Clinical Notes Transcription</h3>
              <div className="bg-white/5 rounded-lg p-4 min-h-32">
                <p className="text-white whitespace-pre-wrap">{transcription || 'No transcription yet'}</p>
              </div>
            </div>

            {whiteboardImage && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Whiteboard Image</h3>
                <img src={whiteboardImage} alt="Whiteboard" className="w-full rounded-lg" />
              </div>
            )}

            <Button
              onClick={handleCompleteAppointment}
              disabled={loading || !transcription}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? 'Completing...' : 'Complete Appointment & Send Report'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
