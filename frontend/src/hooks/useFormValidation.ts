import { useState } from 'react'
import * as yup from 'yup'

interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function useFormValidation<T>(schema: yup.Schema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = async (data: unknown): Promise<ValidationResult> => {
    try {
      await schema.validate(data, { abortEarly: false })
      setErrors({})
      return { isValid: true, errors: {} }
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const fieldErrors: Record<string, string> = {}
        
        error.inner.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path] = err.message
          }
        })
        
        setErrors(fieldErrors)
        return { isValid: false, errors: fieldErrors }
      }
      
      return { isValid: false, errors: { general: 'Erro de validação' } }
    }
  }

  const validateField = async (fieldName: string, value: unknown): Promise<string | null> => {
    try {
      // Validação simples do campo individual
      const testData = { [fieldName]: value }
      await schema.validate(testData)
      
      // Remove erro do campo se validação passou
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
      
      return null
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errorMessage = error.message || 'Campo inválido'
        
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
