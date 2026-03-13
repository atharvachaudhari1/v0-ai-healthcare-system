'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useRouter } from 'next/navigation'

// ElevenLabs System Prompt for Medical Assessment
const MEDICAL_SYSTEM_PROMPT = `You are MediAI, a professional medical intake specialist AI agent. Your role is to conduct a thorough medical assessment through conversation with the patient.

ASSESSMENT PROTOCOL:
1. Greeting: Greet warmly and explain you'll be asking about their health concerns
2. Chief Complaint: Ask what brings them in today and let them describe symptoms
3. Symptom Details: For each symptom, ask:
   - Severity (1-10 scale)
   - Duration (how long experiencing)
   - Frequency (constant, intermittent, triggered by something)
   - Associated symptoms
4. Risk Indicators: Listen for critical symptoms like:
   - Chest pain/pressure
   - Severe shortness of breath
   - Loss of consciousness
   - Severe bleeding
   - Sudden severe headache
5. Medical Context: Ask about:
   - Recent illnesses or injuries
   - Stress levels
   - Sleep quality
   - Exercise habits
   - Dietary changes
6. Summarize: At the end, summarize what you've learned and assign preliminary risk category:
   - CRITICAL: Immediate symptoms requiring urgent care
   - HIGH: Serious symptoms needing specialist within hours
   - MEDIUM: Significant concerns needing specialist within days
   - LOW: Minor concerns suitable for general practice

CONVERSATION STYLE:
- Empathetic and professional
- Use clear, understandable language
- Avoid medical jargon unless necessary
- Ask one question at a time
- Listen actively and follow up on important points
- Be encouraging and reassuring

SYMPTOM SEVERITY SCORING (0-100):
- Chest pain, severe dyspnea, altered consciousness = 80-100 (Critical)
- Moderate pain, fever, significant functional loss = 60-79 (High)
- Mild to moderate symptoms, normal function = 40-59 (Medium)
- Minimal symptoms, no functional impact = 0-39 (Low)

Always conclude by asking if there's anything else they want to mention and then provide a summary of the consultation.`

interface VoiceAssessmentProps {
  patientId?: string
  onComplete?: (assessment: any) => void
}

export function VoiceAssessment({ patientId, onComplete }: VoiceAssessmentProps) {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('ready')
  const [conversationData, setConversationData] = useState<any>(null)
  const conversationIdRef = useRef<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/auth/login')
      }
    }
    checkUser()
  }, [router, supabase])

  const startVoiceAssessment = async () => {
    setIsLoading(true)
    setError(null)
    setStatus('connecting')

    try {
      // Check if ElevenLabs API key is set
      const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
      if (!apiKey) {
        throw new Error('ElevenLabs API key not configured. Please add NEXT_PUBLIC_ELEVENLABS_API_KEY to your environment variables.')
      }

      // Create conversation on ElevenLabs
      const response = await fetch('https://api.elevenlabs.io/v1/convai/conversation/start_session', {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || 'default_agent',
          system_prompt: MEDICAL_SYSTEM_PROMPT,
          conversation_config_override: {
            agent: {
              prompt: {
                prompt: MEDICAL_SYSTEM_PROMPT,
              },
            },
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to start conversation')
      }

      const data = await response.json()
      conversationIdRef.current = data.conversation_id
      setStatus('recording')
      setIsConnected(true)

      // Listen for conversation completion
      monitorConversation(data.conversation_id)
    } catch (err: any) {
      setError(err.message || 'Failed to start voice assessment')
      setStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  const monitorConversation = async (conversationId: string) => {
    const maxAttempts = 120 // 2 minutes with 1-second checks
    let attempts = 0

    const checkStatus = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
        const response = await fetch(
          `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
          {
            headers: {
              'xi-api-key': apiKey || '',
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          
          if (data.status === 'finished' || data.status === 'ended') {
            setStatus('complete')
            setConversationData(data)
            
            // Save assessment to database
            if (patientId) {
              await saveAssessment(data)
            }
            return
          }
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 1000)
        } else {
          setStatus('timeout')
          setError('Voice assessment session timed out')
        }
      } catch (err) {
        console.error('Error monitoring conversation:', err)
        setTimeout(checkStatus, 2000)
      }
    }

    checkStatus()
  }

  const saveAssessment = async (data: any) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) return

      const { error: insertError } = await supabase
        .from('voice_conversations')
        .insert([
          {
            patient_id: user.id,
            conversation_id: data.conversation_id,
            transcript: data.transcript || '',
            duration_seconds: data.duration_seconds || 0,
            assessment_data: data,
          },
        ])

      if (insertError) throw insertError

      // Call onComplete callback or redirect
      if (onComplete) {
        onComplete(data)
      } else {
        router.push('/patient/risk-assessment')
      }
    } catch (err: any) {
      console.error('Failed to save assessment:', err.message)
    }
  }

  const endAssessment = async () => {
    if (conversationIdRef.current) {
      try {
        setStatus('ending')
        const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
        
        await fetch(
          `https://api.elevenlabs.io/v1/convai/conversations/${conversationIdRef.current}/end_session`,
          {
            method: 'POST',
            headers: {
              'xi-api-key': apiKey || '',
            },
          }
        )

        setStatus('complete')
        setIsConnected(false)
      } catch (err) {
        console.error('Error ending conversation:', err)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">AI Medical Assessment</CardTitle>
            <CardDescription>
              Have a conversation with our AI medical specialist to assess your symptoms.
              This typically takes 3-5 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Display */}
            <div className={`p-4 rounded-lg ${
              status === 'error' ? 'bg-destructive/10 text-destructive' :
              status === 'ready' ? 'bg-muted' :
              status === 'recording' ? 'bg-blue-500/10 text-blue-700' :
              status === 'complete' ? 'bg-green-500/10 text-green-700' :
              'bg-yellow-500/10 text-yellow-700'
            }`}>
              <p className="font-medium">
                {status === 'ready' && 'Ready to start assessment'}
                {status === 'connecting' && 'Connecting to AI specialist...'}
                {status === 'recording' && 'Assessment in progress - speak freely'}
                {status === 'complete' && 'Assessment complete'}
                {status === 'ending' && 'Ending assessment...'}
                {status === 'error' && 'Error occurred'}
                {status === 'timeout' && 'Session timeout'}
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Controls */}
            <div className="space-y-3">
              {!isConnected ? (
                <Button
                  size="lg"
                  onClick={startVoiceAssessment}
                  disabled={isLoading || status === 'complete'}
                  className="w-full"
                >
                  {isLoading && <Spinner className="mr-2" />}
                  {status === 'complete' ? 'Assessment Complete' : 'Start Voice Assessment'}
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 p-4 bg-blue-500/10 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-8 bg-blue-500 rounded animate-pulse" />
                      <div className="w-2 h-8 bg-blue-500 rounded animate-pulse delay-100" />
                      <div className="w-2 h-8 bg-blue-500 rounded animate-pulse delay-200" />
                    </div>
                    <span className="text-sm font-medium">Listening...</span>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={endAssessment}
                    className="w-full"
                  >
                    End Assessment
                  </Button>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-lg bg-muted border border-border">
              <h4 className="font-semibold mb-2">What to expect:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• The AI will greet you and explain the process</li>
                <li>• Describe your symptoms and how they feel</li>
                <li>• Answer questions about your medical history</li>
                <li>• The AI will provide an initial assessment</li>
                <li>• Based on your symptoms, we'll assign you to the right doctor</li>
              </ul>
            </div>

            {status === 'complete' && conversationData && (
              <Button
                onClick={() => router.push('/patient/risk-assessment')}
                className="w-full"
              >
                Continue to Appointment Booking
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
