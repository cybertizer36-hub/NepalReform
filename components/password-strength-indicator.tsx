'use client'

import { Progress } from '@/components/ui/progress'
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthLabel } from '@/lib/utils/auth-validation'
import { CheckCircle, XCircle } from 'lucide-react'

interface PasswordStrengthIndicatorProps {
  password: string
  showFeedback?: boolean
}

export function PasswordStrengthIndicator({ password, showFeedback = true }: PasswordStrengthIndicatorProps) {
  const strength = validatePassword(password)
  
  if (!password) return null

  const progressValue = (strength.score / 4) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Password strength:</span>
        <span className={`text-sm font-medium ${getPasswordStrengthColor(strength.score)}`}>
          {getPasswordStrengthLabel(strength.score)}
        </span>
      </div>
      
      <Progress 
        value={progressValue} 
        className="h-2"
      />
      
      {showFeedback && strength.feedback.length > 0 && (
        <div className="space-y-1">
          {strength.feedback.map((feedback, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <XCircle className="h-3 w-3 text-red-500" />
              <span className="text-red-600">{feedback}</span>
            </div>
          ))}
        </div>
      )}
      
      {showFeedback && strength.isValid && (
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span className="text-green-600">Password meets requirements</span>
        </div>
      )}
    </div>
  )
}
