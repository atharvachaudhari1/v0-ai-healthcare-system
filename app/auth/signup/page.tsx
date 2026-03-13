'use client'

import { AuthForm } from '@/components/auth-form'
import { AccessibilityPanel } from '@/components/accessibility-panel'

export default function Page() {
  return (
    <>
      <AuthForm mode="signup" />
      <AccessibilityPanel />
    </>
  )
}
