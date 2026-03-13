'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface VoiceAssessmentInterfaceProps {
  systemPrompt: string;
  onAssessmentComplete: (data: {
    transcript: string;
    symptoms: string[];
    severity: number;
  }) => void;
  elevenLabsApiKey?: string;
}

export default function VoiceAssessmentInterface({
  systemPrompt,
  onAssessmentComplete,
  elevenLabsApiKey,
}: VoiceAssessmentInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([]);
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // For demo purposes, we'll use a mock implementation
  const mockSymptoms = ['chest_pain', 'shortness_of_breath'];
  const mockSeverity = 7;
  const mockTranscript = 'Patient reported chest pain and difficulty breathing for the past 2 hours. Pain severity is 7/10.';

  useEffect(() => {
    // Initialize audio recording capability
    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.onstart = () => {
          audioChunksRef.current = [];
        };

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          // Here you would send to ElevenLabs API
          handleAudioRecorded(audioBlob);
        };

        mediaRecorderRef.current = mediaRecorder;
      } catch (err: any) {
        setError('Could not access microphone. Please check permissions.');
      }
    };

    initAudio();
  }, []);

  const handleAudioRecorded = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      if (!elevenLabsApiKey) {
        // Mock implementation for demo
        console.log('[VoiceAssessment] Demo mode - using mock response');

        const userMessage = 'Mock patient response';
        const assistantMessage =
          'Thank you for that information. Based on your symptoms, I can see you are experiencing chest pain and shortness of breath. Can you tell me when this started?';

        setConversationHistory((prev) => [
          ...prev,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: assistantMessage },
        ]);

        // Simulate assessment completion
        if (conversationHistory.length > 4) {
          onAssessmentComplete({
            transcript: mockTranscript,
            symptoms: mockSymptoms,
            severity: mockSeverity,
          });
        }
      } else {
        // Real ElevenLabs integration would go here
        // Send audio blob to ElevenLabs API with system prompt
        console.log('[VoiceAssessment] Sending to ElevenLabs API...');

        // Example implementation:
        // const response = await fetch('https://api.elevenlabs.io/v1/convai', {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${elevenLabsApiKey}`,
        //     'Content-Type': 'audio/wav',
        //   },
        //   body: audioBlob,
        // });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process audio');
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError('');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSkipAssessment = () => {
    // Use mock data for demo
    onAssessmentComplete({
      transcript: mockTranscript,
      symptoms: mockSymptoms,
      severity: mockSeverity,
    });
  };

  return (
    <div className="space-y-6">
      {/* Chat History */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 min-h-96 max-h-96 overflow-y-auto">
        {conversationHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <p className="mb-4">Click the microphone button below to start chatting with the AI health assistant.</p>
              <p className="text-sm">The AI will help assess your health condition through a natural conversation.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {conversationHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600/80 text-white rounded-br-none'
                      : 'bg-white/10 border border-white/20 text-slate-100 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Prompt Display (optional) */}
      <details className="bg-white/5 border border-white/10 rounded-lg p-4">
        <summary className="text-sm font-medium text-slate-300 cursor-pointer hover:text-white">
          System Prompt Details
        </summary>
        <div className="mt-4 text-xs text-slate-400 max-h-32 overflow-y-auto bg-white/5 p-3 rounded">
          <p>{systemPrompt.substring(0, 200)}...</p>
        </div>
      </details>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          size="lg"
          className={`${
            isRecording
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isProcessing ? (
            'Processing...'
          ) : isRecording ? (
            <>
              <span className="w-3 h-3 bg-red-400 rounded-full mr-2 animate-pulse"></span>
              Stop Recording
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-14a6 6 0 110 12 6 6 0 010-12z" />
              </svg>
              Start Recording
            </>
          )}
        </Button>

        {conversationHistory.length > 0 && (
          <Button
            onClick={handleSkipAssessment}
            disabled={isRecording || isProcessing}
            variant="outline"
            className="text-white border-white/20 hover:bg-white/10"
          >
            Complete Assessment
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h4 className="font-semibold text-blue-300 mb-2">How to Use</h4>
        <ul className="text-sm text-slate-300 space-y-1">
          <li>• Click "Start Recording" and describe your symptoms naturally</li>
          <li>• The AI will ask follow-up questions about your health</li>
          <li>• Be as detailed as possible about your condition</li>
          <li>• Click "Complete Assessment" when done</li>
          <li>• Note: This demo uses simulated responses. Add your ElevenLabs API key for real voice interaction.</li>
        </ul>
      </div>

      {/* API Key Notice */}
      {!elevenLabsApiKey && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-sm text-yellow-300">
            ⚠️ <strong>ElevenLabs API Key</strong> is not configured. Add{' '}
            <code className="bg-black/20 px-2 py-1 rounded text-xs">NEXT_PUBLIC_ELEVENLABS_API_KEY</code> to your
            environment variables for real voice functionality.
          </p>
        </div>
      )}
    </div>
  );
}
