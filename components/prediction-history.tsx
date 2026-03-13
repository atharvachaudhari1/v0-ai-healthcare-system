'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Calendar, TrendingUp } from 'lucide-react'
import { DiseasePredictionOutput, getSeverityColor, getSeverityLabel } from '@/lib/disease-prediction'
import { format } from 'date-fns'

interface PredictionHistoryProps {
  userId: string
  onSelectPrediction?: (prediction: DiseasePredictionOutput) => void
}

export function PredictionHistory({ userId, onSelectPrediction }: PredictionHistoryProps) {
  const [predictions, setPredictions] = useState<DiseasePredictionOutput[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('disease_predictions')
          .select('*')
          .eq('patient_id', userId)
          .order('created_at', { ascending: false })
          .limit(20)

        if (fetchError) throw fetchError

        const predictions: DiseasePredictionOutput[] = data.map(item => ({
          id: item.id,
          disease: item.predicted_disease,
          probability: item.probability,
          confidenceScore: item.confidence_score,
          severityLevel: item.severity_level,
          riskFactors: item.risk_factors || [],
          explanation: item.gemini_explanation,
          precautions: item.precautions || [],
          doctorConsultation: item.doctor_consultation,
          disclaimer: item.disclaimer,
          createdAt: item.created_at
        }))

        setPredictions(predictions)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history')
      } finally {
        setLoading(false)
      }
    }

    fetchPredictions()
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-sm text-red-800">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (predictions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <TrendingUp className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600">No predictions yet. Start a new assessment to see your history.</p>
        </CardContent>
      </Card>
    )
  }

  const selectedPrediction = predictions.find(p => p.id === selectedId)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Predictions List */}
      <div className="lg:col-span-1 space-y-2">
        <h3 className="font-semibold text-sm text-gray-700 mb-3">Prediction History</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {predictions.map(prediction => (
            <button
              key={prediction.id}
              onClick={() => {
                setSelectedId(prediction.id)
                onSelectPrediction?.(prediction)
              }}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                selectedId === prediction.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{prediction.disease}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(prediction.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <div
                  className="px-2 py-1 rounded text-xs font-semibold text-white flex-shrink-0"
                  style={{ backgroundColor: getSeverityColor(prediction.severityLevel) }}
                >
                  {prediction.confidenceScore}%
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Prediction Details */}
      {selectedPrediction && (
        <div className="lg:col-span-2 space-y-4">
          {/* Main Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedPrediction.disease}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(selectedPrediction.createdAt), 'PPP p')}
                  </CardDescription>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                  style={{ backgroundColor: getSeverityColor(selectedPrediction.severityLevel) }}
                >
                  {getSeverityLabel(selectedPrediction.severityLevel)}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Confidence Meter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Confidence Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold text-blue-600">{selectedPrediction.confidenceScore}%</p>
                  <p className="text-xs text-gray-500">
                    Probability: {(selectedPrediction.probability * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all"
                    style={{ width: `${selectedPrediction.confidenceScore}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Factors */}
          {selectedPrediction.riskFactors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {selectedPrediction.riskFactors.map((factor, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Explanation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Explanation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-gray-700">{selectedPrediction.explanation}</p>
            </CardContent>
          </Card>

          {/* Precautions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Precautions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {selectedPrediction.precautions.map((precaution, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{precaution}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
