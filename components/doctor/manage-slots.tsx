'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ManageSlotsProps {
  doctorId: string;
  doctorUserId: string;
}

export default function ManageSlots({ doctorId, doctorUserId }: ManageSlotsProps) {
  const [formData, setFormData] = useState({
    slotDate: '',
    slotTime: '',
    maxPatients: '4',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();

      // Add appointment slots for the specified date and time
      const slotsToAdd = [];
      for (let i = 0; i < parseInt(formData.maxPatients); i++) {
        const slotTime = new Date(`2024-01-01 ${formData.slotTime}`);
        slotTime.setMinutes(slotTime.getMinutes() + i * 30); // 30-minute intervals

        slotsToAdd.push({
          doctor_id: doctorId,
          slot_date: formData.slotDate,
          slot_time: slotTime.toTimeString().slice(0, 5),
          is_available: true,
        });
      }

      const { error: insertError } = await supabase
        .from('appointment_slots')
        .insert(slotsToAdd);

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData({ slotDate: '', slotTime: '', maxPatients: '4' });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add slots');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Create Appointment Slots</h2>

        {success && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
            <p className="text-green-200">Appointment slots added successfully!</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleAddSlot} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Date</label>
            <Input
              type="date"
              name="slotDate"
              value={formData.slotDate}
              onChange={handleChange}
              required
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Start Time</label>
            <Input
              type="time"
              name="slotTime"
              value={formData.slotTime}
              onChange={handleChange}
              required
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Number of Slots (30 min intervals)
            </label>
            <Input
              type="number"
              name="maxPatients"
              value={formData.maxPatients}
              onChange={handleChange}
              min="1"
              max="8"
              required
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Creating Slots...' : 'Create Appointment Slots'}
          </Button>
        </form>

        <div className="mt-8 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
          <h3 className="text-blue-300 font-semibold mb-2">Example</h3>
          <p className="text-sm text-blue-200">
            If you create slots for {formData.slotDate || 'a date'} at {formData.slotTime || '09:00'} with{' '}
            {formData.maxPatients} slots, patients can book appointments at:
          </p>
          <ul className="text-sm text-blue-200 mt-2 space-y-1">
            {[0, 1, 2, 3].map((i) => {
              if (formData.slotTime) {
                const baseTime = new Date(`2024-01-01 ${formData.slotTime}`);
                baseTime.setMinutes(baseTime.getMinutes() + i * 30);
                return (
                  <li key={i}>
                    • {baseTime.toTimeString().slice(0, 5)}
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
