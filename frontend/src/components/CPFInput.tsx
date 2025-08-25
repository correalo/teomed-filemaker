'use client'

import React, { useState, useEffect } from 'react'
import { validateAndFormatCPF, formatCPF } from '../utils/viaCep'

interface CPFInputProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  className?: string
  style?: React.CSSProperties
  showValidation?: boolean
  placeholder?: string
}

export default function CPFInput({ 
  value, 
  onChange, 
  readOnly = false, 
  className = '', 
  style,
  showValidation = true,
  placeholder = "000.000.000-00"
}: CPFInputProps) {
  const [touched, setTouched] = useState(false)
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; error?: string }>({ isValid: true })

  useEffect(() => {
    if (value && showValidation) {
      const result = validateAndFormatCPF(value)
      setValidationResult({ isValid: result.isValid, error: result.error })
    } else {
      setValidationResult({ isValid: true })
    }
  }, [value, showValidation])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return
    
    const inputValue = e.target.value
    const formatted = formatCPF(inputValue)
    onChange(formatted)
  }

  const handleBlur = () => {
    setTouched(true)
  }

  const showError = showValidation && !validationResult.isValid && value.trim() !== ''
  const inputClassName = `${className} ${showError ? 'border-red-500 focus:border-red-500 text-red-500 bg-red-50' : ''}`

  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        readOnly={readOnly}
        className={inputClassName}
        style={style}
        placeholder={placeholder}
        maxLength={14} // 000.000.000-00
      />
      {showError && validationResult.error && (
        <p className="text-red-500 text-xs mt-1">{validationResult.error}</p>
      )}
    </div>
  )
}
