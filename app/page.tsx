'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | 'admin' | null>(null);

  const handleLogin = (role: 'patient' | 'doctor' | 'admin') => {
    setUserRole(role);
    router.push(`/auth/login?role=${role}`);
  };

  const handleSignUp = (role: 'patient' | 'doctor' | 'admin') => {
    setUserRole(role);
    router.push(`/auth/signup?role=${role}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">MediAI</h1>
          <p className="text-xl text-slate-300">
            AI-Powered Healthcare Platform with Voice-Based Medical Intake
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Patient Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 hover:bg-white/15 transition">
            <div className="mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Patient</h3>
              <p className="text-slate-300 text-sm">
                Schedule appointments and get AI-powered health assessments
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => handleLogin('patient')}
                variant="outline"
                className="w-full text-white border-white/20 hover:bg-white/10"
              >
                Sign In
              </Button>
              <Button
                onClick={() => handleSignUp('patient')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Sign Up
              </Button>
            </div>
          </div>

          {/* Doctor Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 hover:bg-white/15 transition">
            <div className="mb-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Doctor</h3>
              <p className="text-slate-300 text-sm">
                Manage appointments, review patient assessments, and provide care
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => handleLogin('doctor')}
                variant="outline"
                className="w-full text-white border-white/20 hover:bg-white/10"
              >
                Sign In
              </Button>
              <Button
                onClick={() => handleSignUp('doctor')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Sign Up
              </Button>
            </div>
          </div>

          {/* Admin Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 hover:bg-white/15 transition">
            <div className="mb-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Administrator</h3>
              <p className="text-slate-300 text-sm">
                Manage system, doctors, and platform operations
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => handleLogin('admin')}
                variant="outline"
                className="w-full text-white border-white/20 hover:bg-white/10"
              >
                Sign In
              </Button>
              <Button
                onClick={() => handleSignUp('admin')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Platform Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">AI Voice Assessment</h3>
                <p className="text-sm text-slate-300">Intelligent voice-based medical intake with ElevenLabs</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Risk Scoring</h3>
                <p className="text-sm text-slate-300">ML-based patient triage and priority assignment</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Whiteboard & Transcription</h3>
                <p className="text-sm text-slate-300">Digital whiteboard with Gemini Vision transcription</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-orange-500/20 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Smart Scheduling</h3>
                <p className="text-sm text-slate-300">Automated appointment booking with queue management</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
