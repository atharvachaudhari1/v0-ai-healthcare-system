'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface AccessibilitySettings {
  dyslexiaFriendly: boolean
  highContrast: boolean
  reducedMotion: boolean
  largerText: boolean
  expandedSpacing: boolean
  simplifiedUI: boolean
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  toggleSetting: (key: keyof AccessibilitySettings) => void
  resetSettings: () => void
}

const defaultSettings: AccessibilitySettings = {
  dyslexiaFriendly: false,
  highContrast: false,
  reducedMotion: false,
  largerText: false,
  expandedSpacing: false,
  simplifiedUI: false,
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(
  undefined
)

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load settings from localStorage
    const saved = localStorage.getItem('a11y-settings')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load accessibility settings', e)
      }
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('a11y-settings', JSON.stringify(settings))
      
      // Apply settings to document
      const root = document.documentElement
      if (settings.dyslexiaFriendly) {
        root.style.fontFamily = '"OpenDyslexic", "Comic Sans MS", sans-serif'
      } else {
        root.style.fontFamily = ''
      }
      
      if (settings.highContrast) {
        root.classList.add('high-contrast')
      } else {
        root.classList.remove('high-contrast')
      }
      
      if (settings.reducedMotion) {
        root.classList.add('reduced-motion')
      } else {
        root.classList.remove('reduced-motion')
      }

      if (settings.expandedSpacing) {
        root.classList.add('expanded-spacing')
      } else {
        root.classList.remove('expanded-spacing')
      }
    }
  }, [settings, mounted])

  const toggleSetting = (key: keyof AccessibilitySettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  return (
    <AccessibilityContext.Provider value={{ settings, toggleSetting, resetSettings }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return context
}
