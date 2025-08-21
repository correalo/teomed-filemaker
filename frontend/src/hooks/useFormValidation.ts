import { useState } from 'react'
import { z } from 'zod'

interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (data: unknown): ValidationResult => {
    try {
      schema.parse(data)
      setErrors({})
      return { isValid: true, errors: {} }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        
        error.issues.forEach((err: z.ZodIssue) => {
          const path = err.path.join('.')
          fieldErrors[path] = err.message
        })
        
        setErrors(fieldErrors)
        return { isValid: false, errors: fieldErrors }
      }
      
      return { isValid: false, errors: { general: 'Erro de validação' } }
    }
  }

  const validateField = (fieldName: string, value: unknown): string | null => {
    try {
      // Validação simples do campo individual
      const testData = { [fieldName]: value }
      schema.parse(testData)
      
      // Remove erro do campo se validação passou
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
      
      return null
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues[0]?.message || 'Campo inválido'
        
        setErrors(prev => ({
          ...prev,
          [fieldName]: errorMessage
        }))
        
        return errorMessage
      }
      
      return 'Erro de validação'
    }
  }

  const clearErrors = () => {
    setErrors({})
  }

  const clearFieldError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[fieldName]
      return newErrors
    })
  }

  const getFieldError = (fieldName: string): string | undefined => {
    return errors[fieldName]
  }

  const hasErrors = Object.keys(errors).length > 0

  return {
    errors,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    getFieldError,
    hasErrors
  }
}
