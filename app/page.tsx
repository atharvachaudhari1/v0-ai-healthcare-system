import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-16">
          <div className="text-2xl font-bold">MediAI</div>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
            Healthcare Reimagined with AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience intelligent medical assessment, risk scoring, and seamless doctor appointments powered by AI voice technology.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup?role=patient">
              <Button size="lg" className="gap-2">
                Start as Patient
              </Button>
            </Link>
            <Link href="/auth/signup?role=doctor">
              <Button size="lg" variant="outline">
                Start as Doctor
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <Card>
            <CardHeader>
              <div className="text-3xl mb-2">🎙️</div>
              <CardTitle>Voice Assessment</CardTitle>
              <CardDescription>
                AI-powered medical intake through natural conversation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our advanced voice agent conducts thorough symptom assessments in just minutes, understanding your health concerns naturally.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-3xl mb-2">📊</div>
              <CardTitle>Risk Scoring</CardTitle>
              <CardDescription>
                Intelligent severity assessment and specialty matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our algorithm analyzes symptoms, vitals, and medical history to provide accurate risk levels and recommend the right specialist.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-3xl mb-2">👨‍⚕️</div>
              <CardTitle>Smart Queue</CardTitle>
              <CardDescription>
                Doctor appointments prioritized by medical urgency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Doctors see patients in order of medical priority, ensuring critical cases get immediate attention while others are scheduled efficiently.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-3xl mb-2">✍️</div>
              <CardTitle>Digital Whiteboard</CardTitle>
              <CardDescription>
                AI-powered clinical note transcription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Doctors draw and write notes freely. Our AI instantly transcribes them into structured medical documentation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-3xl mb-2">📧</div>
              <CardTitle>Email Delivery</CardTitle>
              <CardDescription>
                Instant prescription and summary distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Patients receive complete appointment summaries, prescriptions, and clinical notes immediately after their visit.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-3xl mb-2">♿</div>
              <CardTitle>Accessible Design</CardTitle>
              <CardDescription>
                ADHD and dyslexia-friendly interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Multiple accessibility modes including dyslexia-friendly fonts, high contrast, and customizable spacing for all users.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold mb-6">For Patients</h3>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Enter Health Information</p>
                    <p className="text-sm text-muted-foreground">
                      Provide biometrics and medical history
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Voice Assessment</p>
                    <p className="text-sm text-muted-foreground">
                      Chat with AI about your symptoms
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Receive Risk Assessment</p>
                    <p className="text-sm text-muted-foreground">
                      See your risk score and recommended specialist
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Book Appointment</p>
                    <p className="text-sm text-muted-foreground">
                      Schedule with a doctor in your specialty
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-6">For Doctors</h3>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">View Smart Queue</p>
                    <p className="text-sm text-muted-foreground">
                      See patients sorted by medical urgency
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Review Patient Data</p>
                    <p className="text-sm text-muted-foreground">
                      See symptoms, vitals, and risk assessment
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Document with Whiteboard</p>
                    <p className="text-sm text-muted-foreground">
                      Draw notes and observations freely
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium">AI Transcribes & Sends</p>
                    <p className="text-sm text-muted-foreground">
                      System converts notes and sends to patient
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-12 text-center mb-20">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Healthcare?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of patients and doctors using MediAI for smarter, faster healthcare.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup?role=patient">
              <Button size="lg">Sign Up as Patient</Button>
            </Link>
            <Link href="/auth/signup?role=doctor">
              <Button size="lg" variant="outline">
                Sign Up as Doctor
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-muted-foreground">
          <p>© 2024 MediAI. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
