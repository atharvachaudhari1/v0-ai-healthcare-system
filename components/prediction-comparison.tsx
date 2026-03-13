'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import { DiseasePredictionOutput, getSeverityColor } from '@/lib/disease-prediction'
import { format } from 'date-fns'

interface PredictionComparisonProps {
  userId: string
}

export function PredictionComparison({ userId }: PredictionComparisonProps) {
  const [predictions, setPredictions] = useState<DiseasePredictionOutput[]>([])
  const [selectedPredictions, setSelectedPredictions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('disease_predictions')
          .select('*')
          .eq('patient_id', userId)
          .order('created_at', { ascending: false })
          .limit(10)

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
        setError(err instanceof Error ? err.message : 'Failed to load predictions')
      } finally {
        setLoading(false)
      }
    }

    fetchPredictions()
  }, [userId])

  const toggleSelection = (id: string) => {
    setSelectedPredictions(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id].slice(-3)
    )
  }

  const comparingPredictions = predictions.filter(p => selectedPredictions.includes(p.id))

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

  return (
    <div className="space-y-6">
      {/* Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Predictions to Compare</CardTitle>
          <CardDescription>Choose up to 3 predictions to view side-by-side</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {predictions.map(prediction => (
              <label key={prediction.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <Checkbox
                  checked={selectedPredictions.includes(prediction.id)}
                  onCheckedChange={() => toggleSelection(prediction.id)}
                  disabled={selectedPredictions.length >= 3 && !selectedPredictions.includes(prediction.id)}
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{prediction.disease}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(prediction.createdAt), 'MMM d, yyyy')} • Confidence: {prediction.confidenceScore}%
                  </p>
                </div>
                <div
                  className="px-2 py-1 rounded text-xs font-semibold text-white"
                  style={{ backgroundColor: getSeverityColor(prediction.severityLevel) }}
                >
                  {prediction.severityLevel}
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison View */}
      {comparingPredictions.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4">Comparison Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparingPredictions.map(prediction => (
              <Card key={prediction.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="space-y-2">
                    <CardTitle className="text-base">{prediction.disease}</CardTitle>
                    <CardDescription className="text-xs">
                      {format(new Date(prediction.createdAt), 'PPP')}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Severity Badge */}
                  <div
                    className="px-3 py-1 rounded-full text-white text-xs font-semibold text-center"
                    style={{ backgroundColor: getSeverityColor(prediction.severityLevel) }}
                  >
                    {prediction.severityLevel}
                  </div>

                  {/* Confidence */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Confidence</p>
                    <div className="flex items-end justify-between">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${prediction.confidenceScore}%` }}
                        />
                      </div>
                      <p className="text-sm font-bold text-blue-600 whitespace-nowrap">{prediction.confidenceScore}%</p>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  {prediction.riskFactors.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">Risk Factors</p>
                      <ul className="space-y-1">
                        {prediction.riskFactors.slice(0, 3).map((factor, idx) => (
                          <li key={idx} className="text-xs text-gray-700 flex items-start gap-1">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Summary */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Summary</p>
                    <p className="text-xs text-gray-700 line-clamp-3">{prediction.explanation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trends */}
          {comparingPredictions.length >= 2 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Confidence Trend */}
                <div>
                  <p className="text-sm font-semibold mb-3">Confidence Score Trend</p>
                  <div className="flex items-end gap-4 h-32">
                    {comparingPredictions.map(pred => (
                      <div key={pred.id} className="flex-1 text-center">
                        <div className="flex-1 bg-gray-200 rounded-t" style={{ height: `${pred.confidenceScore * 1.2}px` }} />
                        <p className="text-xs font-semibold mt-2">{pred.confidenceScore}%</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(pred.createdAt), 'MMM d')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consistency */}
                <div>
                  <p className="text-sm font-semibold mb-2">Prediction Consistency</p>
                  <div className="space-y-2">
                    {comparingPredictions.some(p => p.disease === comparingPredictions[0].disease) ? (
                      <p className="text-sm text-green-700 bg-green-50 p-3 rounded">
                        ✓ Consistent diagnosis: Same condition predicted in {comparingPredictions.filter(p => p.disease === comparingPredictions[0].disease).length} of {comparingPredictions.length} predictions
                      </p>
                    ) : (
                      <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded">
                        ⚠ Different conditions predicted. Consider consulting a healthcare professional for clarity.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
