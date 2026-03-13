'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { BlockchainBadge } from '@/components/blockchain-badge'
import { computeHash, shortHash, type BlockchainAnchor } from '@/lib/blockchain'
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
  // Blockchain snapshot state
  const [snapshotHash, setSnapshotHash] = useState<string | null>(null)
  const [isSnapshoting, setIsSnapshoting] = useState(false)
  const [snapshotAnchor, setSnapshotAnchor] = useState<BlockchainAnchor | null>(null)

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

  const takeSnapshotHash = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setIsSnapshoting(true)
    try {
      const imageData = canvas.toDataURL('image/png')
      // Hash the raw pixel data so any drawing change invalidates the hash
      const hash = await computeHash(imageData)
      setSnapshotHash(hash)

      // Build a minimal anchor stub for the whiteboard snapshot
      // (Full anchor happens when appointment is completed)
      const now = new Date().toISOString()
      const simTx = await computeHash(`${hash}:${now}:whiteboard-snapshot`)
      const genesis = new Date('2024-01-01T00:00:00Z').getTime()
      const blockNumber = Math.floor((Date.now() - genesis) / 15000)
      const network = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK || 'mock'
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

      setSnapshotAnchor({
        recordId: `wb_snap_${appointmentId}_${Date.now()}`,
        appointmentId,
        payloadHash: hash,
        txHash: `0x${simTx}`,
        blockNumber,
        anchoredAt: now,
        network,
        verifyUrl: `${appUrl}/patient/verify-record/${appointmentId}`,
        status: 'anchored',
      })
    } catch {
      // silent fail — snapshot is best-effort
    } finally {
      setIsSnapshoting(false)
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
              disabled={isTranscribing || isSnapshoting}
              className="flex-1"
            >
              {isTranscribing && <Spinner className="mr-2" />}
              Transcribe with AI
            </Button>
            <Button
              onClick={takeSnapshotHash}
              disabled={isTranscribing || isSnapshoting}
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              title="Compute SHA-256 fingerprint of current whiteboard state"
            >
              {isSnapshoting ? <Spinner className="mr-2" /> : (
                <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )}
              Lock Snapshot
            </Button>
            <Button
              onClick={clearCanvas}
              variant="outline"
              disabled={isTranscribing || isSnapshoting}
            >
              Clear
            </Button>
          </div>

          {/* Whiteboard Blockchain Snapshot */}
          {snapshotHash && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Whiteboard snapshot locked
              </div>
              <div className="font-mono text-emerald-700 break-all">
                SHA-256: {shortHash(snapshotHash, 20)}
              </div>
              <p className="text-emerald-600 italic">
                Any change to the whiteboard will produce a different hash. Final anchor is created at consultation close.
              </p>
            </div>
          )}

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
