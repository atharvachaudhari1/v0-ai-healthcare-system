'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, Loader2 } from 'lucide-react'
import {
  DiseasePredictionInput,
  DiseasePredictionOutput,
  submitPrediction,
  COMMON_SYMPTOMS,
  PAIN_LOCATIONS,
  DURATION_OPTIONS,
  getSeverityColor,
  getSeverityLabel,
  calculateBMI,
  getBMICategory,
} from '@/lib/disease-prediction'

interface DiseasePredictorProps {
  onPredictionComplete?: (prediction: DiseasePredictionOutput) => void
}

export function DiseasePredictor({ onPredictionComplete }: DiseasePredictorProps) {
  const [step, setStep] = useState<'symptoms' | 'details' | 'result'>('symptoms')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [customSymptom, setCustomSymptom] = useState('')
  const [painLocation, setPainLocation] = useState('')
  const [duration, setDuration] = useState('')
  const [severity, setSeverity] = useState<number>(5)
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [result, setResult] = useState<DiseasePredictionOutput | null>(null)

  const handleAddSymptom = (symptom: string) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom])
    }
  }

  const handleRemoveSymptom = (symptom: string) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom))
  }

  const handleAddCustomSymptom = () => {
    if (customSymptom && !selectedSymptoms.includes(customSymptom)) {
      setSelectedSymptoms([...selectedSymptoms, customSymptom])
      setCustomSymptom('')
    }
  }

  const handleSubmitSymptoms = () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom')
      return
    }
    setError(null)
    setStep('details')
  }

  const handleSubmitPrediction = async () => {
    if (!painLocation || !duration) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const input: DiseasePredictionInput = {
        symptoms: selectedSymptoms,
        painLocation,
        duration,
        severity,
        age: age ? parseInt(age) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
      }

      const prediction = await submitPrediction(input)
      setResult(prediction)
      setStep('result')
      onPredictionComplete?.(prediction)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get prediction')
    } finally {
      setLoading(false)
    }
  }

  const bmi = weight && height ? calculateBMI(parseFloat(weight), parseFloat(height)) : null
  const bmiCategory = bmi ? getBMICategory(bmi) : null

  return (
    <div className="space-y-6">
      {step === 'symptoms' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Your Symptoms</CardTitle>
              <CardDescription>
                Choose all symptoms you're experiencing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Selected symptoms */}
              {selectedSymptoms.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Selected Symptoms</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map(symptom => (
                      <div
                        key={symptom}
                        className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm flex items-center gap-2"
                      >
                        {symptom}
                        <button
                          onClick={() => handleRemoveSymptom(symptom)}
                          className="ml-1 hover:text-blue-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common symptoms grid */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Common Symptoms</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {COMMON_SYMPTOMS.map(symptom => (
                    <button
                      key={symptom}
                      onClick={() => handleAddSymptom(symptom)}
                      className={`p-3 rounded-lg border-2 transition-colors text-left ${
                        selectedSymptoms.includes(symptom)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <p className="text-sm font-medium">{symptom}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom symptom */}
              <div className="space-y-2">
                <Label htmlFor="custom-symptom">Other Symptoms</Label>
                <div className="flex gap-2">
                  <Input
                    id="custom-symptom"
                    placeholder="Type a symptom..."
                    value={customSymptom}
                    onChange={(e) => setCustomSymptom(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustomSymptom()
                      }
                    }}
                  />
                  <Button onClick={handleAddCustomSymptom} variant="outline">
                    Add
                  </Button>
                </div>
              </div>

              <Button onClick={handleSubmitSymptoms} className="w-full">
                Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'details' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Help us provide more accurate predictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Pain Location */}
              <div className="space-y-2">
                <Label htmlFor="pain-location">Pain Location (Required)</Label>
                <Select value={painLocation} onValueChange={setPainLocation}>
                  <SelectTrigger id="pain-location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAIN_LOCATIONS.map(location => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (Required)</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map(d => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Severity Slider */}
              <div className="space-y-2">
                <Label>
                  Severity: <span className="font-bold">{severity}/10</span>
                </Label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-sm text-gray-600">
                  {severity <= 3 ? 'Mild' : severity <= 6 ? 'Moderate' : 'Severe'}
                </p>
              </div>

              {/* Optional Biometrics */}
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-medium text-gray-600">
                  Optional: Biometric Information
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="age" className="text-xs">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Years"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="weight" className="text-xs">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="kg"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="height" className="text-xs">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="cm"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                </div>

                {bmi && (
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <p>BMI: <span className="font-bold">{bmi}</span> ({bmiCategory})</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('symptoms')} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSubmitPrediction} disabled={loading} className="flex-1">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Get Prediction
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'result' && result && (
        <div className="space-y-4">
          {/* Severity Badge */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{result.disease}</CardTitle>
                  <CardDescription>Predicted Condition</CardDescription>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                  style={{ backgroundColor: getSeverityColor(result.severityLevel) }}
                >
                  {getSeverityLabel(result.severityLevel)}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Confidence Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Confidence Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all"
                  style={{ width: `${result.confidenceScore}%` }}
                />
              </div>
              <p className="text-2xl font-bold text-blue-600">{result.confidenceScore}%</p>
            </CardContent>
          </Card>

          {/* Risk Factors */}
          {result.riskFactors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Risk Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.riskFactors.map((factor, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span className="text-sm">{factor}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Explanation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What This Means</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{result.explanation}</p>
            </CardContent>
          </Card>

          {/* Precautions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommended Precautions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.precautions.map((precaution, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-sm">{precaution}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Doctor Consultation */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">When to Consult a Doctor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800">{result.doctorConsultation}</p>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <p className="text-xs text-amber-900">{result.disclaimer}</p>
            </CardContent>
          </Card>

          <Button onClick={() => setStep('symptoms')} className="w-full">
            New Prediction
          </Button>
        </div>
      )}
    </div>
  )
}
