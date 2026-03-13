'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface AppointmentsViewProps {
  doctorId: string;
  doctorUserId: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  risk_level: string;
  risk_score: number;
  patient_name: string;
  patient_email: string;
}

export default function AppointmentsView({ doctorId, doctorUserId }: AppointmentsViewProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed'>('all');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const supabase = createClient();

        let query = supabase
          .from('appointments')
          .select(
            `
            id,
            appointment_date,
            appointment_time,
            status,
            risk_level,
            risk_score,
            users!patient_id (
              email,
              user_metadata
            )
          `
          )
          .eq('doctor_id', doctorId);

        if (filter !== 'all') {
          query = query.eq('status', filter);
        }

        const { data } = await query.order('appointment_date', { ascending: false });

        const formatted = (data || []).map((appt: any) => ({
          id: appt.id,
          appointment_date: appt.appointment_date,
          appointment_time: appt.appointment_time,
          status: appt.status,
          risk_level: appt.risk_level,
          risk_score: appt.risk_score,
          patient_name: `${appt.users?.user_metadata?.first_name || ''} ${appt.users?.user_metadata?.last_name || ''}`.trim(),
          patient_email: appt.users?.email || '',
        }));

        setAppointments(formatted);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorId, filter]);

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Appointments</h2>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'scheduled', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-slate-300">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="text-center text-slate-300">No appointments found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-slate-400">Patient</th>
                <th className="text-left py-3 px-4 text-slate-400">Date & Time</th>
                <th className="text-left py-3 px-4 text-slate-400">Risk Level</th>
                <th className="text-left py-3 px-4 text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div className="text-white">{appt.patient_name}</div>
                    <div className="text-xs text-slate-400">{appt.patient_email}</div>
                  </td>
                  <td className="py-3 px-4 text-white">
                    {new Date(appt.appointment_date).toLocaleDateString()} at{' '}
                    {appt.appointment_time}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appt.risk_level === 'critical'
                          ? 'bg-red-500/20 text-red-400'
                          : appt.risk_level === 'high'
                            ? 'bg-orange-500/20 text-orange-400'
                            : appt.risk_level === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {appt.risk_level.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appt.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
