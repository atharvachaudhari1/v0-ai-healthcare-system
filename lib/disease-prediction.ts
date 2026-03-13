export interface DiseasePredictionInput {
  symptoms: string[]
  painLocation?: string
  duration?: string
  severity?: number
  age?: number
  weight?: number
  height?: number
  medicalHistory?: string[]
}

export interface DiseasePredictionOutput {
  id: string
  disease: string
  probability: number
  confidenceScore: number
  severityLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  riskFactors: string[]
  explanation: string
  precautions: string[]
  doctorConsultation: string
  disclaimer: string
  createdAt: string
}

export const SEVERITY_COLORS = {
  Low: '#10b981',      // Green
  Medium: '#f59e0b',   // Amber
  High: '#ef4444',     // Red
  Critical: '#7c2d12'  // Dark red
}

export const SEVERITY_LABELS = {
  Low: 'Low Risk',
  Medium: 'Moderate Risk',
  High: 'High Risk',
  Critical: 'Critical - Seek Immediate Care'
}

export const COMMON_SYMPTOMS = [
  'Fever',
  'Cough',
  'Sore Throat',
  'Headache',
  'Body Ache',
  'Chest Pain',
  'Shortness of Breath',
  'Dizziness',
  'Nausea',
  'Vomiting',
  'Diarrhea',
  'Abdominal Pain',
  'Fatigue',
  'Loss of Appetite',
  'Chills'
]

export const PAIN_LOCATIONS = [
  'Chest',
  'Head',
  'Abdomen',
  'Back',
  'Joints',
  'Muscles',
  'Throat',
  'Ears',
  'Sinuses',
  'Limbs'
]

export const DURATION_OPTIONS = [
  'Hours',
  'Days',
  'Weeks',
  'Months'
]

export async function submitPrediction(input: DiseasePredictionInput): Promise<DiseasePredictionOutput> {
  const response = await fetch('/api/disease-prediction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get prediction')
  }

  const data = await response.json()
  return data.prediction
}

export function getSeverityColor(severity: string): string {
  return SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || '#6b7280'
}

export function getSeverityLabel(severity: string): string {
  return SEVERITY_LABELS[severity as keyof typeof SEVERITY_LABELS] || 'Unknown'
}

export function calculateBMI(weight: number, height: number): number {
  // height in cm, weight in kg
  const heightInMeters = height / 100
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}
