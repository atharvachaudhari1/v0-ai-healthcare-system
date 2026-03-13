'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Mic, StopCircle, Loader2 } from 'lucide-react'

interface PatientVoiceAssessmentProps {
  userId: string
  biometricsData: any
  onComplete: () => void
}

const SYSTEM_PROMPT = `You are an AI medical intake specialist conducting an initial patient assessment. Your role is to:

1. Ask about the patient's PRIMARY SYMPTOMS in a conversational manner
2. Assess SYMPTOM SEVERITY on a scale of 1-10
3. Ask about DURATION and PROGRESSION of symptoms
4. Inquire about ASSOCIATED SYMPTOMS
5. Understand MEDICAL RELEVANCE to categorize into specialties

For high-risk indicators (chest pain, difficulty breathing, severe headache, etc.), be thorough and careful.

Output Format (after assessment is complete):
SYMPTOMS: [list of symptoms]
SEVERITY: [overall severity 1-10]
SPECIALTY: [Cardiology/Neurology/Gastroenterology/Orthopedics/General]
RISK_SCORE: [0-100 based on severity and vital signs]
NOTES: [key findings for doctor]`

export function PatientVoiceAssessment({
  userId,
  biometricsData,
  onComplete,
}: PatientVoiceAssessmentProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [assessmentResult, setAssessmentResult] = useState<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const supabase = createClient()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await processAudio(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      toast.error('Failed to access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    try {
      // Convert audio to base64 or send to ElevenLabs
      // For now, this is a placeholder - you'll implement actual ElevenLabs integration
      const formData = new FormData()
      formData.append('audio', audioBlob)
      formData.append('userId', userId)

      const response = await fetch('/api/voice/process', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to process audio')

      const data = await response.json()
      setTranscript(data.transcript)
      setAssessmentResult(data.assessment)

      // Save to database
      const { error } = await supabase
        .from('voice_conversations')
        .insert([
          {
            patient_id: userId,
            transcript: data.transcript,
            assessment_data: data.assessment,
            duration: 0,
          },
        ])

      if (error) throw error

      toast.success('Assessment completed!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to process assessment')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Voice Assessment</CardTitle>
        <CardDescription>
          Let's talk about your symptoms. Our AI will guide you through a brief assessment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            💡 Tip: Speak naturally about your symptoms. Our AI will ask follow-up questions to better understand your condition.
          </p>
        </div>

        {!transcript && !assessmentResult && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Click the button below and describe your symptoms clearly
              </p>
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                size="lg"
                className={isRecording ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {isRecording ? (
                  <>
                    <StopCircle className="mr-2 h-4 w-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Start Recording
                  </>
                )}
              </Button>
              {isProcessing && (
                <div className="mt-4 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing your assessment...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {transcript && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-2">Your Response:</p>
              <p className="text-sm">{transcript}</p>
            </div>

            {assessmentResult && (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-900 mb-2">Assessment Summary:</p>
                  <ul className="text-sm text-green-900 space-y-1">
                    <li>
                      <strong>Symptoms:</strong> {assessmentResult.symptoms}
                    </li>
                    <li>
                      <strong>Severity:</strong> {assessmentResult.severity}/10
                    </li>
                    <li>
                      <strong>Recommended Specialty:</strong> {assessmentResult.specialty}
                    </li>
                    <li>
                      <strong>Risk Level:</strong> {assessmentResult.risk_score > 70 ? 'High' : assessmentResult.risk_score > 40 ? 'Medium' : 'Low'}
                    </li>
                  </ul>
                </div>

                <Button onClick={onComplete} className="w-full">
                  Continue to Book Appointment
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
