'use client'

import React, { useState } from 'react'
import { useAccessibility } from '@/lib/accessibility-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'

export function AccessibilityPanel() {
  const { settings, toggleSetting, resetSettings } = useAccessibility()
  const [isOpen, setIsOpen] = useState(false)

  const accessibilityOptions = [
    {
      key: 'dyslexiaFriendly',
      label: 'Dyslexia-Friendly Font',
      description: 'Uses OpenDyslexic font designed for better readability',
    },
    {
      key: 'highContrast',
      label: 'High Contrast Mode',
      description: 'Increases contrast between text and background',
    },
    {
      key: 'reducedMotion',
      label: 'Reduce Motion',
      description: 'Minimizes animations and transitions',
    },
    {
      key: 'largerText',
      label: 'Larger Text',
      description: 'Increases font size across the application',
    },
    {
      key: 'expandedSpacing',
      label: 'Expanded Spacing',
      description: 'Adds more space between elements for clarity',
    },
    {
      key: 'simplifiedUI',
      label: 'Simplified UI',
      description: 'Removes complex visual elements',
    },
  ]

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center"
        aria-label="Open accessibility settings"
        title="Accessibility Settings"
      >
        <span className="text-lg">A</span>
      </button>

      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Accessibility Settings</CardTitle>
            <CardDescription>Customize the interface to suit your needs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {accessibilityOptions.map((option) => (
              <label
                key={option.key}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={settings[option.key as keyof typeof settings]}
                  onChange={() => toggleSetting(option.key as keyof typeof settings)}
                  className="mt-1 w-4 h-4 cursor-pointer"
                  aria-label={option.label}
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </label>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={resetSettings}
              className="w-full mt-4"
            >
              Reset to Default
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
