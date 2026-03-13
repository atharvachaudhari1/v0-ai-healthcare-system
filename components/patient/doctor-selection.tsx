'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

interface DoctorSelectionProps {
  specialty: string;
  onSelect: (doctor: any) => void;
}

export default function DoctorSelection({ specialty, onSelect }: DoctorSelectionProps) {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const supabase = createClient();

        const query = supabase
          .from('doctor_profiles')
          .select('id, user_id, specialization, first_name, last_name, license_number, bio')
          .eq('is_verified', true);

        if (specialty) {
          query.ilike('specialization', `%${specialty}%`);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        setDoctors(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch doctors');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [specialty]);

  if (loading) {
    return (
      <div className="text-center text-slate-300">
        Loading doctors...
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

      {doctors.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 text-center">
          <p className="text-slate-300">
            {specialty
              ? `No doctors found for ${specialty}. Please try another specialty.`
              : 'No doctors available. Please try again later.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 hover:bg-white/15 transition cursor-pointer"
              onClick={() => onSelect(doctor)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Dr. {doctor.first_name} {doctor.last_name}
                  </h3>
                  <p className="text-slate-400">{doctor.specialization}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {doctor.bio && (
                <p className="text-sm text-slate-300 mb-4">{doctor.bio}</p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">License: {doctor.license_number}</span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(doctor);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Select
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
