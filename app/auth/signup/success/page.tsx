'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import { useAccessibility } from '@/lib/accessibility-context'

export default function SignupSuccessPage() {
  const router = useRouter()
  const { settings } = useAccessibility()

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        settings.highContrast ? 'bg-black text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}
      style={{
        fontSize: settings.largerText ? '18px' : '16px',
      }}
    >
      <Card className={`w-full max-w-md mx-4 text-center ${settings.highContrast ? 'border-white' : ''}`}>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className={settings.largerText ? 'text-2xl' : ''}>
            Signup Successful!
          </CardTitle>
          <CardDescription className={settings.largerText ? 'text-base' : ''}>
            Please check your email to confirm your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={settings.largerText ? 'text-base' : 'text-sm'}>
            We've sent a confirmation link to your email address. Click the link to activate your account.
          </p>
          <Button
            onClick={() => router.push('/auth/login')}
            className="w-full"
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
