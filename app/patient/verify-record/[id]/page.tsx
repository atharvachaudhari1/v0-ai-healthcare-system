'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { shortHash, type BlockchainAnchor } from '@/lib/blockchain'

interface VerifyPageProps {
  params: { id: string }
}

interface VerifyResponse {
  verified: boolean
  anchor?: BlockchainAnchor
  integrityCheck?: {
    valid: boolean
    tampered: boolean
    message: string
    computedHash?: string
    storedHash?: string
  }
  error?: string
}

export default function VerifyRecordPage({ params }: VerifyPageProps) {
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<VerifyResponse | null>(null)

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`/api/blockchain/verify/${params.id}`)
        const data: VerifyResponse = await res.json()
        setResult(data)
      } catch {
        setResult({ verified: false, error: 'Network error during verification' })
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [params.id])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F5F6] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Verifying blockchain record...</p>
        </div>
      </div>
    )
  }

  const anchor = result?.anchor
  const integrity = result?.integrityCheck
  const isVerified = result?.verified && integrity?.valid !== false

  return (
    <div className="min-h-screen bg-[#F3F5F6] py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Clinical Record Verification</h1>
          <p className="text-muted-foreground mt-1">AyuAI Blockchain Notary · Appointment #{params.id.slice(0, 8)}...</p>
        </div>

        {/* Verification Result Banner */}
        {result?.error ? (
          <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6 text-center space-y-2">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-red-800">Record Not Found</h2>
            <p className="text-sm text-red-600">{result.error}</p>
          </div>
        ) : isVerified ? (
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6 text-center space-y-2">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-emerald-800">Record Verified</h2>
            <p className="text-sm text-emerald-700">
              {integrity?.message || 'This clinical summary is authentic and has not been tampered with.'}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6 text-center space-y-2">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-red-800">Verification Failed</h2>
            <p className="text-sm text-red-600">
              {integrity?.message || 'This record may have been tampered with.'}
            </p>
          </div>
        )}

        {/* Anchor Details */}
        {anchor && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Blockchain Anchor Proof
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-[140px_1fr] gap-y-2 gap-x-4">
                <span className="text-muted-foreground font-medium">Network</span>
                <span className="capitalize font-mono">
                  {anchor.network}
                  {anchor.network === 'mock' && (
                    <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1 py-0.5 rounded">DEMO</span>
                  )}
                </span>

                <span className="text-muted-foreground font-medium">Block</span>
                <span className="font-mono">#{anchor.blockNumber?.toLocaleString()}</span>

                <span className="text-muted-foreground font-medium">Anchored At</span>
                <span>{new Date(anchor.anchoredAt).toLocaleString()}</span>

                <span className="text-muted-foreground font-medium">Tx Hash</span>
                <div className="flex items-center gap-2 min-w-0">
                  <code className="font-mono text-xs break-all text-emerald-700">
                    {shortHash(anchor.txHash, 16)}
                  </code>
                  <button
                    onClick={() => copyToClipboard(anchor.txHash)}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                    title="Copy full hash"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>

                <span className="text-muted-foreground font-medium">Payload Hash</span>
                <div className="flex items-center gap-2 min-w-0">
                  <code className="font-mono text-xs break-all text-emerald-700">
                    {shortHash(anchor.payloadHash, 16)}
                  </code>
                  <button
                    onClick={() => copyToClipboard(anchor.payloadHash)}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                    title="Copy full hash"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Hash Comparison (integrity check) */}
              {integrity?.computedHash && (
                <div className="mt-3 pt-3 border-t space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Integrity Check</p>
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-28 shrink-0">Stored hash:</span>
                      <code className="text-emerald-700 break-all">{shortHash(integrity.storedHash || '', 20)}</code>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-28 shrink-0">Computed hash:</span>
                      <code className={`break-all ${integrity.tampered ? 'text-red-600' : 'text-emerald-700'}`}>
                        {shortHash(integrity.computedHash, 20)}
                      </code>
                    </div>
                    <div className={`font-semibold mt-1 ${integrity.valid ? 'text-emerald-700' : 'text-red-600'}`}>
                      {integrity.valid ? 'MATCH — Record unmodified' : 'MISMATCH — Potential tampering detected'}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* What This Means */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How This Works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              When your doctor completed this consultation, AyuAI computed a SHA-256 fingerprint
              (hash) of the full consultation record — including transcription, prescription, and
              clinical notes.
            </p>
            <p>
              That hash was anchored to the blockchain. Any modification to the record would produce
              a completely different hash, making tampering instantly detectable.
            </p>
            <p>
              You can share this page link with any clinic, pharmacy, or specialist to prove your
              consultation record is authentic and unmodified.
            </p>
          </CardContent>
        </Card>

        {/* Share Link */}
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <p className="text-sm font-semibold">Share Verification Link</p>
          <div className="flex gap-2">
            <code className="flex-1 text-xs bg-muted rounded px-2 py-1.5 break-all">
              {typeof window !== 'undefined' ? window.location.href : `.../${params.id}`}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(typeof window !== 'undefined' ? window.location.href : '')}
            >
              Copy
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
