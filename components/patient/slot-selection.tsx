'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

interface SlotSelectionProps {
  doctorId: string;
  onSelect: (slot: { date: string; time: string }) => void;
  onBack: () => void;
}

export default function SlotSelection({ doctorId, onSelect, onBack }: SlotSelectionProps) {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const supabase = createClient();

        // Fetch available slots for the doctor
        const { data, error: fetchError } = await supabase
          .from('appointment_slots')
          .select('*')
          .eq('doctor_id', doctorId)
          .eq('is_available', true)
          .order('slot_date', { ascending: true })
          .order('slot_time', { ascending: true });

        if (fetchError) throw fetchError;

        setSlots(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch available slots');
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [doctorId]);

  const handleSelectSlot = (slot: any) => {
    onSelect({
      date: slot.slot_date,
      time: slot.slot_time,
    });
  };

  if (loading) {
    return (
      <div className="text-center text-slate-300">
        Loading available slots...
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

      {slots.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 text-center">
          <p className="text-slate-300 mb-4">
            No available appointment slots at this time. Please try another doctor or check back later.
          </p>
          <Button onClick={onBack} variant="outline" className="text-white border-white/20 hover:bg-white/10">
            Select Another Doctor
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Available Appointment Slots</h3>

            {/* Group slots by date */}
            {Object.entries(
              slots.reduce(
                (acc: Record<string, any[]>, slot) => {
                  const date = slot.slot_date;
                  if (!acc[date]) acc[date] = [];
                  acc[date].push(slot);
                  return acc;
                },
                {}
              )
            ).map(([date, dateSlots]) => (
              <div key={date} className="mb-6">
                <h4 className="text-white font-medium mb-3">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h4>

                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {dateSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleSelectSlot(slot)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                    >
                      {slot.slot_time}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <Button onClick={onBack} variant="outline" className="flex-1 text-white border-white/20 hover:bg-white/10">
              Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
