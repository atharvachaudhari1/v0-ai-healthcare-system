'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import html2canvas from 'html2canvas'

interface DoctorWhiteboardProps {
  appointmentId: string
  patientName: string
  onTranscriptionComplete?: (transcription: string, imageUrl: string) => void
}

export function DoctorWhiteboard({
  appointmentId,
  patientName,
  onTranscriptionComplete,
}: DoctorWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcription, setTranscription] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setTranscription('')
  }

  const transcribeWhiteboard = async () => {
    setIsTranscribing(true)
    setError(null)

    try {
      const canvas = canvasRef.current
      if (!canvas) throw new Error('Canvas not found')

      // Convert canvas to image
      const imageData = canvas.toDataURL('image/png')

      // Check if Gemini API key is set
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (!apiKey) {
        throw new Error('Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to environment variables.')
      }

      // Call Gemini Vision API
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Please transcribe all text and medical notes visible in this whiteboard/image. Format the output as clear, structured medical notes with sections for symptoms, observations, and recommendations.',
                },
                {
                  inlineData: {
                    mimeType: 'image/png',
                    data: imageData.split(',')[1], // Remove data:image/png;base64, prefix
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error?.message || 'Failed to transcribe whiteboard'
        )
      }

      const data = await response.json()
      const transcribedText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        'No transcription available'

      setTranscription(transcribedText)

      // Call onComplete callback
      if (onTranscriptionComplete) {
        onTranscriptionComplete(transcribedText, imageData)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to transcribe whiteboard')
    } finally {
      setIsTranscribing(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Doctor's Whiteboard</CardTitle>
          <CardDescription>
            Draw notes and observations for {patientName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Canvas */}
          <div className="border-2 border-dashed border-border rounded-lg overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full cursor-crosshair"
              style={{ display: 'block' }}
            />
          </div>

          {/* Controls */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={transcribeWhiteboard}
              disabled={isTranscribing}
              className="flex-1"
            >
              {isTranscribing && <Spinner className="mr-2" />}
              Transcribe with AI
            </Button>
            <Button
              onClick={clearCanvas}
              variant="outline"
              disabled={isTranscribing}
            >
              Clear
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Transcription Result */}
          {transcription && (
            <div className="p-4 rounded-lg bg-muted border border-border">
              <h3 className="font-semibold mb-2">AI Transcription:</h3>
              <p className="text-sm whitespace-pre-wrap text-foreground">
                {transcription}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
