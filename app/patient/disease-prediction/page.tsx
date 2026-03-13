'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { DiseasePredictor } from '@/components/disease-predictor'
import { PredictionHistory } from '@/components/prediction-history'
import { PredictionComparison } from '@/components/prediction-comparison'
import { DiseasePredictionOutput } from '@/lib/disease-prediction'
import { AccessibilityPanel } from '@/components/accessibility-panel'

export default function DiseasePredictionPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [latestPrediction, setLatestPrediction] = useState<DiseasePredictionOutput | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        router.push('/auth/login')
        return
      }

      if (user.user_metadata?.role !== 'patient') {
        router.push(`/${user.user_metadata?.role}/dashboard`)
        return
      }

      setUser(user)
      setLoading(false)
    }

    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F3F5F6] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-[#1F2937]">AyuAI Predictor</h1>
          <p className="text-gray-600 mt-2">
            Analyze your symptoms and get preliminary health insights powered by AI
          </p>
        </div>

        {/* Latest Prediction Alert */}
        {latestPrediction && (
          <Card className="mb-8 border-[#A7F3D0] bg-[#F9FAFB] shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Latest Prediction</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{latestPrediction.disease}</span> - 
                Confidence: <span className="font-bold text-[#0F9D6C]">{latestPrediction.confidenceScore}%</span>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="predictor" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="predictor">New Prediction</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="comparison">Compare</TabsTrigger>
          </TabsList>

          <TabsContent value="predictor" className="space-y-4">
            <Card className="rounded-[16px] shadow-[0_10px_25px_rgba(0,0,0,0.05)] border-0">
              <CardHeader>
                <CardTitle>Symptom Analysis</CardTitle>
                <CardDescription>
                  Describe your symptoms and let our AI analyze them
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DiseasePredictor onPredictionComplete={setLatestPrediction} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card className="rounded-[16px] shadow-[0_10px_25px_rgba(0,0,0,0.05)] border-0">
              <CardHeader>
                <CardTitle>Prediction History</CardTitle>
                <CardDescription>
                  View all your past predictions and health insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PredictionHistory userId={user?.id} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-4">
            <Card className="rounded-[16px] shadow-[0_10px_25px_rgba(0,0,0,0.05)] border-0">
              <CardHeader>
                <CardTitle>Compare Predictions</CardTitle>
                <CardDescription>
                  Compare multiple predictions to see trends and patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PredictionComparison userId={user?.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card className="rounded-[16px] shadow-[0_10px_25px_rgba(0,0,0,0.05)] border-0 bg-[#FFFFFF]">
            <CardHeader>
              <CardTitle className="text-base">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="text-2xl">1</div>
                <p><span className="font-semibold">Describe Your Symptoms</span> - Select or type the symptoms you're experiencing</p>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">2</div>
                <p><span className="font-semibold">Provide Details</span> - Add location, duration, and biometric data for accuracy</p>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">3</div>
                <p><span className="font-semibold">Get Analysis</span> - AI predicts the likely condition with confidence score</p>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">4</div>
                <p><span className="font-semibold">Get Guidance</span> - Receive precautions and doctor consultation recommendations</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[16px] border-[#A7F3D0] bg-[#F9FAFB] shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
            <CardHeader>
              <CardTitle className="text-base text-[#1F2937]">Important Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#6B7280] space-y-2">
              <p>
                This AI Disease Predictor is a preliminary analysis tool and should not be considered a medical diagnosis.
              </p>
              <p>
                Always consult with qualified healthcare professionals for:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Professional medical diagnosis</li>
                <li>Prescription and treatment plans</li>
                <li>Emergency medical situations</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <AccessibilityPanel />
    </div>
  )
}
