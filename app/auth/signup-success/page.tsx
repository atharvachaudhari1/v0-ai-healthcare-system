'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SignUpSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role') || 'patient';

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push(`/auth/login?role=${role}`);
    }, 5000);

    return () => clearTimeout(timer);
  }, [router, role]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-3xl font-bold text-white mb-4">Account Created!</h1>
          <p className="text-slate-300 mb-6">
            Your account has been successfully created. A confirmation email has been sent to your email address.
          </p>

          <p className="text-slate-400 text-sm mb-8">
            Please check your email to confirm your account. You will be redirected to login in a few seconds.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href={`/auth/login?role=${role}`}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Go to Login
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10">
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Note */}
          <p className="text-xs text-slate-500 mt-6">
            Redirecting in 5 seconds...
          </p>
        </div>
      </div>
    </main>
  );
}
