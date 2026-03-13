'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

interface BiometricFormProps {
  patientId: string;
  onSuccess: () => void;
}

export default function BiometricForm({ patientId, onSuccess }: BiometricFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    bloodType: '',
    medicalHistory: '',
    allergies: '',
    currentMedications: '',
    heartRate: '',
    bloodPressure: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();

      // Save biometric data
      const { error: bioError } = await supabase
        .from('biometrics')
        .insert({
          user_id: patientId,
          age: parseInt(formData.age),
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          blood_type: formData.bloodType,
          heart_rate: formData.heartRate ? parseInt(formData.heartRate) : null,
          blood_pressure: formData.bloodPressure || null,
          temperature: formData.temperature ? parseFloat(formData.temperature) : null,
          respiratory_rate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : null,
          oxygen_saturation: formData.oxygenSaturation ? parseFloat(formData.oxygenSaturation) : null,
        });

      if (bioError) throw bioError;

      // Update patient profile
      const { error: profileError } = await supabase
        .from('patient_profiles')
        .update({
          medical_history: formData.medicalHistory,
          allergies: formData.allergies,
          current_medications: formData.currentMedications,
          biometrics_completed: true,
        })
        .eq('user_id', patientId);

      if (profileError) throw profileError;

      setSuccess(true);
      setFormData({
        age: '',
        weight: '',
        height: '',
        bloodType: '',
        medicalHistory: '',
        allergies: '',
        currentMedications: '',
        heartRate: '',
        bloodPressure: '',
        temperature: '',
        respiratoryRate: '',
        oxygenSaturation: '',
      });

      // Redirect to voice assessment
      setTimeout(() => {
        router.push('/patient/voice-assessment');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to save biometric data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Biometric Data Collection</h2>
        <p className="text-slate-300 mb-6">
          Please provide your basic health information and current vital signs. This helps us assess your health status accurately.
        </p>

        {success && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
            <p className="text-green-200">Biometric data saved successfully! Redirecting to voice assessment...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Age</label>
                <Input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="25"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Blood Type</label>
                <Input
                  type="text"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  placeholder="O+"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Physical Measurements */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Physical Measurements</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Weight (kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="70"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Height (cm)</label>
                <Input
                  type="number"
                  step="0.1"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="175"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Current Vital Signs</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Heart Rate (bpm)</label>
                <Input
                  type="number"
                  name="heartRate"
                  value={formData.heartRate}
                  onChange={handleChange}
                  placeholder="72"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Blood Pressure (e.g., 120/80)</label>
                <Input
                  type="text"
                  name="bloodPressure"
                  value={formData.bloodPressure}
                  onChange={handleChange}
                  placeholder="120/80"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Temperature (°C)</label>
                <Input
                  type="number"
                  step="0.1"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  placeholder="37.0"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Respiratory Rate (breaths/min)</label>
                <Input
                  type="number"
                  name="respiratoryRate"
                  value={formData.respiratoryRate}
                  onChange={handleChange}
                  placeholder="16"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">Oxygen Saturation (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  name="oxygenSaturation"
                  value={formData.oxygenSaturation}
                  onChange={handleChange}
                  placeholder="98"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Medical Background</h3>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Medical History</label>
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                placeholder="List any chronic conditions, surgeries, or health issues (e.g., diabetes, hypertension)"
                rows={3}
                className="w-full bg-white/10 border border-white/20 text-white placeholder:text-slate-400 rounded px-3 py-2"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-white mb-2">Allergies</label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="List any allergies to medications, foods, or other substances"
                rows={2}
                className="w-full bg-white/10 border border-white/20 text-white placeholder:text-slate-400 rounded px-3 py-2"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-white mb-2">Current Medications</label>
              <textarea
                name="currentMedications"
                value={formData.currentMedications}
                onChange={handleChange}
                placeholder="List any medications you are currently taking"
                rows={2}
                className="w-full bg-white/10 border border-white/20 text-white placeholder:text-slate-400 rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Saving...' : 'Save Biometric Data & Continue'}
          </Button>
        </form>
      </div>
    </div>
  );
}
