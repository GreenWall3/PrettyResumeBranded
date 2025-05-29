'use client'

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Key, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProUpgradeButton } from "@/components/settings/pro-upgrade-button"

function checkForApiKeys() {
  const storedKeys = localStorage.getItem('Pretty_Resume-api-keys')
  if (!storedKeys) return false
  
  try {
    const keys = JSON.parse(storedKeys)
    return Array.isArray(keys) && keys.length > 0
  } catch {
    return false
  }
}

interface ApiKeyAlertProps {
  hideNotification?: boolean;
}

export function ApiKeyAlert({ hideNotification = false }: ApiKeyAlertProps) {
  const [hasApiKeys, setHasApiKeys] = useState(true) // Start with true to prevent flash

  useEffect(() => {
    setHasApiKeys(checkForApiKeys())

    // Listen for storage changes
    const handleStorageChange = () => {
      setHasApiKeys(checkForApiKeys())
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  if (hideNotification || hasApiKeys) return null

  return (
    <Alert className="border border-red-200 bg-white shadow-sm rounded-xl overflow-hidden">
      {/* Top accent border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-rose-500"></div>
      
      <div className="flex items-start">
        <div className="shrink-0 p-1 bg-red-100 rounded-full mr-3">
          <AlertCircle className="h-4 w-4 text-red-600" />
        </div>
        
        <AlertDescription className="flex flex-col gap-4 flex-1">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-red-700">
                API keys required for AI features
              </h3>
              <div className="flex flex-col gap-2">
                <a 
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1.5 group"
                >
                  <Key className="h-3.5 w-3.5" />
                  <span className="group-hover:underline">Get Anthropic API key (Recommended)</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
                <a 
                  href="https://platform.openai.com/docs/quickstart/create-and-export-an-api-key"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1.5 group"
                >
                  <Key className="h-3.5 w-3.5" />
                  <span className="group-hover:underline">Get OpenAI API key</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </div>
            </div>
            <Link href="/settings">
              <Button
                size="sm"
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-sm whitespace-nowrap"
              >
                Set API Keys
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-t border-red-100 pt-4">
            <span className="text-sm text-red-600 whitespace-nowrap">
              Or upgrade to Pro for full access
            </span>
            <ProUpgradeButton />
          </div>
        </AlertDescription>
      </div>
    </Alert>
  )
} 