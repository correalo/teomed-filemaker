'use client'

import React, { useState } from 'react'
import { formatEmail, validateEmail } from '../utils/viaCep'

interface EmailInputProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  className?: string
  style?: React.CSSProperties
  placeholder?: string
  showValidation?: boolean
}

export default function EmailInput({ 
  value, 
  onChange, 
  readOnly = false, 
  className = '', 
  style,
  placeholder = "exemplo@email.com",
  showValidation = true
}: EmailInputProps) {
  const [touched, setTouched] = useState(false)
  
  const isValid = !value || validateEmail(value)
  const showError = touched && !isValid && value.length > 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedEmail = formatEmail(e.target.value)
    onChange(formattedEmail)
  }

  const handleBlur = () => {
    setTouched(true)
  }

  return (
    <div>
      <input
        type="email"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        readOnly={readOnly}
        className={`${className} ${showError && showValidation ? 'border-red-500' : ''}`}
        style={style}
        placeholder={readOnly ? '' : placeholder}
      />
      {showError && showValidation && (
        <p className="text-red-500 text-xs mt-1">Email deve ter formato válido (exemplo@email.com)</p>
      )}
    </div>
  )
}
