'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { shortHash, getExplorerUrl, type BlockchainAnchor } from '@/lib/blockchain'

interface BlockchainBadgeProps {
  anchor: BlockchainAnchor
  showDetails?: boolean
}

export function BlockchainBadge({ anchor, showDetails = false }: BlockchainBadgeProps) {
  const [expanded, setExpanded] = useState(showDetails)
  const explorerUrl = getExplorerUrl(anchor.txHash, anchor.network)
  const isMock = anchor.network === 'mock'

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-2">
      {/* Status Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-emerald-800">
            Blockchain Anchored
          </span>
          {isMock && (
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
              DEMO
            </span>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-emerald-600 hover:text-emerald-800 underline"
        >
          {expanded ? 'Hide' : 'Details'}
        </button>
      </div>

      {/* Hash Preview */}
      <div className="flex items-center gap-2">
        <svg className="h-3.5 w-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <code className="text-xs font-mono text-emerald-700 break-all">
          {shortHash(anchor.payloadHash, 12)}
        </code>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-2 pt-2 border-t border-emerald-200 space-y-2 text-xs text-emerald-800">
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <span className="font-semibold text-emerald-600">Record ID:</span>
            <code className="font-mono break-all">{anchor.recordId}</code>

            <span className="font-semibold text-emerald-600">Payload Hash:</span>
            <code className="font-mono break-all">{anchor.payloadHash}</code>

            <span className="font-semibold text-emerald-600">Tx Hash:</span>
            <code className="font-mono break-all">{shortHash(anchor.txHash, 16)}</code>

            <span className="font-semibold text-emerald-600">Block:</span>
            <span>#{anchor.blockNumber.toLocaleString()}</span>

            <span className="font-semibold text-emerald-600">Network:</span>
            <span className="capitalize">{anchor.network}</span>

            <span className="font-semibold text-emerald-600">Anchored At:</span>
            <span>{new Date(anchor.anchoredAt).toLocaleString()}</span>
          </div>

          <div className="flex gap-2 pt-1 flex-wrap">
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700"
              >
                View on Explorer
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            <a
              href={anchor.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs bg-white border border-emerald-300 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-50"
            >
              Verify Record
            </a>
          </div>

          {isMock && (
            <p className="text-xs text-amber-600 italic">
              Demo mode: hash is real SHA-256, tx is simulated. Connect to Sepolia/Polygon for production anchoring.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

interface BlockchainStatusCardProps {
  anchor: BlockchainAnchor | null
  isAnchoring: boolean
  error?: string | null
}

export function BlockchainStatusCard({ anchor, isAnchoring, error }: BlockchainStatusCardProps) {
  return (
    <Card className="border-emerald-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Blockchain Record
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAnchoring && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            Anchoring consultation to blockchain...
          </div>
        )}
        {error && !isAnchoring && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {anchor && !isAnchoring && (
          <BlockchainBadge anchor={anchor} showDetails />
        )}
        {!anchor && !isAnchoring && !error && (
          <p className="text-sm text-muted-foreground">
            Consultation record will be anchored to blockchain when appointment is completed.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
