'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DoctorNav({ user, onTabChange }: { user: any; onTabChange: (tab: string) => void }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white/5 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">MediAI</h2>
            <p className="text-xs text-slate-400">Doctor Portal</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-white">
                Dr. {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
              </p>
              <p className="text-xs text-slate-400">{user?.user_metadata?.specialization}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-t border-white/10 pt-4">
          <button
            onClick={() => onTabChange('queue')}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition"
          >
            Patient Queue
          </button>
          <button
            onClick={() => onTabChange('slots')}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition"
          >
            Manage Slots
          </button>
          <button
            onClick={() => onTabChange('appointments')}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition"
          >
            Appointments
          </button>
        </div>
      </div>
    </nav>
  );
}
