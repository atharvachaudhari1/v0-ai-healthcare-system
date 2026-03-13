'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { useRouter } from 'next/navigation'

interface BiometricData {
  age: number
  gender: string
  weight: number
  height: number
  blood_pressure_systolic: number
  blood_pressure_diastolic: number
  heart_rate: number
  temperature: number
  medical_history: string
  allergies: string
  current_medications: string
}

interface PatientBiometricFormProps {
  userId: string
  onSubmit: (data: BiometricData) => void
}

export function PatientBiometricForm({ userId, onSubmit }: PatientBiometricFormProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<BiometricData>({
    age: 30,
    gender: 'male',
    weight: 70,
    height: 175,
    blood_pressure_systolic: 120,
    blood_pressure_diastolic: 80,
    heart_rate: 70,
    temperature: 98.6,
    medical_history: '',
    allergies: '',
    current_medications: '',
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('biometrics')
        .insert([
          {
            patient_id: userId,
            ...formData,
          },
        ])

      if (insertError) throw insertError

      onSubmit(formData)
    } catch (err: any) {
      setError(err.message || 'Failed to save biometric data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Your Health Profile</CardTitle>
            <CardDescription>
              Please enter your basic health information. This helps us assess your symptoms accurately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldGroup>
                    <FieldLabel htmlFor="age">Age (years)</FieldLabel>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min="1"
                      max="150"
                      value={formData.age}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <FieldLabel htmlFor="gender">Gender</FieldLabel>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </FieldGroup>
                </div>
              </div>

              {/* Vital Signs */}
              <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                <h3 className="font-semibold text-lg">Vital Signs</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldGroup>
                    <FieldLabel htmlFor="weight">Weight (kg)</FieldLabel>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <FieldLabel htmlFor="height">Height (cm)</FieldLabel>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      step="0.1"
                      value={formData.height}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <FieldLabel htmlFor="heart_rate">Heart Rate (bpm)</FieldLabel>
                    <Input
                      id="heart_rate"
                      name="heart_rate"
                      type="number"
                      min="30"
                      max="200"
                      value={formData.heart_rate}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <FieldLabel htmlFor="temperature">Temperature (°C)</FieldLabel>
                    <Input
                      id="temperature"
                      name="temperature"
                      type="number"
                      step="0.1"
                      min="35"
                      max="42"
                      value={formData.temperature}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <FieldLabel htmlFor="blood_pressure_systolic">BP Systolic (mmHg)</FieldLabel>
                    <Input
                      id="blood_pressure_systolic"
                      name="blood_pressure_systolic"
                      type="number"
                      min="60"
                      max="200"
                      value={formData.blood_pressure_systolic}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <FieldLabel htmlFor="blood_pressure_diastolic">BP Diastolic (mmHg)</FieldLabel>
                    <Input
                      id="blood_pressure_diastolic"
                      name="blood_pressure_diastolic"
                      type="number"
                      min="40"
                      max="130"
                      value={formData.blood_pressure_diastolic}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </FieldGroup>
                </div>
              </div>

              {/* Medical History */}
              <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                <h3 className="font-semibold text-lg">Medical Information</h3>
                
                <FieldGroup>
                  <FieldLabel htmlFor="medical_history">Past Medical History</FieldLabel>
                  <textarea
                    id="medical_history"
                    name="medical_history"
                    value={formData.medical_history}
                    onChange={handleInputChange}
                    placeholder="List any previous illnesses, surgeries, or chronic conditions..."
                    disabled={loading}
                    className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel htmlFor="allergies">Allergies</FieldLabel>
                  <textarea
                    id="allergies"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    placeholder="List any allergies (medications, food, etc.)..."
                    disabled={loading}
                    className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel htmlFor="current_medications">Current Medications</FieldLabel>
                  <textarea
                    id="current_medications"
                    name="current_medications"
                    value={formData.current_medications}
                    onChange={handleInputChange}
                    placeholder="List any medications you're currently taking..."
                    disabled={loading}
                    className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </FieldGroup>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading && <Spinner className="mr-2" />}
                Continue to Voice Assessment
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
