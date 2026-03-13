'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function PatientNav({ user }: { user: any }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white/5 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">MediAI</h2>
          <p className="text-xs text-slate-400">Patient Portal</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-white">{user?.email}</p>
            <p className="text-xs text-slate-400">Patient</p>
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
    </nav>
  );
}
