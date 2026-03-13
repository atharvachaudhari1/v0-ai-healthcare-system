-- ============================================================
-- AyuAI: blockchain_anchors table
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.blockchain_anchors (
  id                    TEXT PRIMARY KEY,             -- anchor_<appointmentId>_<ts>
  appointment_id        UUID NOT NULL,
  payload_hash          TEXT NOT NULL,                -- SHA-256 hex of consultation payload
  tx_hash               TEXT NOT NULL,                -- on-chain tx hash (or simulated)
  block_number          BIGINT,
  network               TEXT NOT NULL DEFAULT 'mock', -- 'mock' | 'sepolia' | 'polygon'
  anchored_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verify_url            TEXT,
  status                TEXT NOT NULL DEFAULT 'anchored',
  doctor_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  consultation_snapshot JSONB,                        -- off-chain data snapshot for re-verification
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by appointment
CREATE INDEX IF NOT EXISTS idx_blockchain_anchors_appointment
  ON public.blockchain_anchors(appointment_id);

-- Index for patient records page
CREATE INDEX IF NOT EXISTS idx_blockchain_anchors_patient
  ON public.blockchain_anchors(patient_id, anchored_at DESC);

-- RLS: doctors can insert their own anchors
ALTER TABLE public.blockchain_anchors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can insert anchors"
  ON public.blockchain_anchors FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

-- Anyone can read anchors (public verification)
CREATE POLICY "Public read for verification"
  ON public.blockchain_anchors FOR SELECT
  USING (true);
