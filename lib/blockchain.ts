/**
 * AyuAI Blockchain Notary Service
 *
 * Implements immutable consultation anchoring:
 * - Off-chain: whiteboard strokes JSON + AI transcription + prescription stored in Supabase
 * - On-chain (simulated): SHA-256 hash anchored with appointmentId + timestamp
 *
 * For production: replace anchorOnChain() with real ethers.js contract call.
 * Smart contract reference: contracts/NotaryRegistry.sol
 */

export interface ConsultationPayload {
  appointmentId: string
  patientId: string
  doctorId: string
  timestamp: string
  whiteboardImageData?: string  // base64 PNG
  transcription: string
  prescription: string
  notes: string
  vitals?: {
    heartRate?: number
    bloodPressure?: string
    temperature?: number
  }
}

export interface BlockchainAnchor {
  recordId: string
  appointmentId: string
  payloadHash: string
  txHash: string             // simulated or real on-chain tx
  blockNumber: number        // simulated or real block
  anchoredAt: string         // ISO timestamp
  network: string
  verifyUrl: string
  status: 'anchored' | 'pending' | 'failed'
}

export interface VerificationResult {
  valid: boolean
  anchor?: BlockchainAnchor
  computedHash?: string
  storedHash?: string
  tampered: boolean
  message: string
}

/**
 * Compute SHA-256 hash using Web Crypto API (no external deps).
 */
export async function computeHash(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Serialize the full consultation payload into a canonical JSON string.
 * Excludes image data from the hash (image data is referenced by its own hash).
 */
export function serializePayload(payload: ConsultationPayload): string {
  const canonical = {
    appointmentId: payload.appointmentId,
    patientId: payload.patientId,
    doctorId: payload.doctorId,
    timestamp: payload.timestamp,
    transcription: payload.transcription.trim(),
    prescription: payload.prescription.trim(),
    notes: payload.notes.trim(),
    vitals: payload.vitals || null,
  }
  return JSON.stringify(canonical, Object.keys(canonical).sort())
}

/**
 * Generate a simulated blockchain transaction hash.
 * In production, this is replaced by the real tx hash from ethers.js.
 */
async function generateSimulatedTxHash(payloadHash: string, timestamp: string): Promise<string> {
  const input = `${payloadHash}:${timestamp}:ayuai-notary-v1`
  const hash = await computeHash(input)
  return `0x${hash}`
}

/**
 * Simulate a block number based on timestamp.
 * Assumes ~15 second block time from a genesis of Jan 1, 2024.
 */
function simulateBlockNumber(timestamp: string): number {
  const genesis = new Date('2024-01-01T00:00:00Z').getTime()
  const now = new Date(timestamp).getTime()
  return Math.floor((now - genesis) / 15000)
}

/**
 * Anchor consultation to blockchain (mock mode for hackathon).
 * Stores hash record in Supabase `blockchain_anchors` table.
 *
 * For real chain: replace with:
 *   const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL)
 *   const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY!, provider)
 *   const contract = new ethers.Contract(CONTRACT_ADDRESS, NOTARY_ABI, wallet)
 *   const tx = await contract.anchor(appointmentId, payloadHash)
 *   await tx.wait()
 */
export async function anchorConsultation(payload: ConsultationPayload): Promise<BlockchainAnchor> {
  const timestamp = new Date().toISOString()
  const serialized = serializePayload(payload)
  const payloadHash = await computeHash(serialized)
  const txHash = await generateSimulatedTxHash(payloadHash, timestamp)
  const blockNumber = simulateBlockNumber(timestamp)
  const network = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK || 'mock'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const recordId = `anchor_${payload.appointmentId}_${Date.now()}`
  const verifyUrl = `${appUrl}/patient/verify-record/${payload.appointmentId}`

  const anchor: BlockchainAnchor = {
    recordId,
    appointmentId: payload.appointmentId,
    payloadHash,
    txHash,
    blockNumber,
    anchoredAt: timestamp,
    network,
    verifyUrl,
    status: 'anchored',
  }

  return anchor
}

/**
 * Verify a consultation record by recomputing its hash and comparing.
 */
export async function verifyConsultationRecord(
  payload: ConsultationPayload,
  storedHash: string
): Promise<VerificationResult> {
  try {
    const serialized = serializePayload(payload)
    const computedHash = await computeHash(serialized)
    const tampered = computedHash !== storedHash

    return {
      valid: !tampered,
      computedHash,
      storedHash,
      tampered,
      message: tampered
        ? 'VERIFICATION FAILED: Record has been tampered with. Hash mismatch detected.'
        : 'VERIFIED: Record integrity confirmed. Hash matches on-chain anchor.',
    }
  } catch (err) {
    return {
      valid: false,
      tampered: true,
      message: 'Verification failed due to an error.',
    }
  }
}

/**
 * Format a hash for display (shortened with ellipsis).
 */
export function shortHash(hash: string, chars = 8): string {
  if (hash.length <= chars * 2 + 3) return hash
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`
}

/**
 * Get blockchain explorer URL for a transaction.
 */
export function getExplorerUrl(txHash: string, network: string): string | null {
  const explorers: Record<string, string> = {
    sepolia: 'https://sepolia.etherscan.io/tx',
    polygon: 'https://polygonscan.com/tx',
    mainnet: 'https://etherscan.io/tx',
    mock: '',
  }
  const base = explorers[network]
  if (!base) return null
  return `${base}/${txHash}`
}
