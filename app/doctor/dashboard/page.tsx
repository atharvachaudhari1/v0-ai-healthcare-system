'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DoctorNav from '@/components/doctor/doctor-nav';
import PatientQueue from '@/components/doctor/patient-queue';
import ManageSlots from '@/components/doctor/manage-slots';
import AppointmentsView from '@/components/doctor/appointments-view';

export default function DoctorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'queue' | 'slots' | 'appointments'>('queue');
  const [doctorProfile, setDoctorProfile] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login?role=doctor');
        return;
      }

      const userRole = user.user_metadata?.role;
      if (userRole !== 'doctor') {
        router.push('/');
        return;
      }

      setUser(user);

      // Fetch doctor profile
      const { data: profile } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setDoctorProfile(profile);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading doctor dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DoctorNav user={user} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, Dr. {user?.user_metadata?.last_name}
          </h1>
          <p className="text-slate-300">Manage your appointments and patient queue</p>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'queue' && (
            <PatientQueue doctorId={doctorProfile?.id} doctorUserId={user?.id} />
          )}
          {activeTab === 'slots' && (
            <ManageSlots doctorId={doctorProfile?.id} doctorUserId={user?.id} />
          )}
          {activeTab === 'appointments' && (
            <AppointmentsView doctorId={doctorProfile?.id} doctorUserId={user?.id} />
          )}
        </div>
      </main>
    </div>
  );
}
