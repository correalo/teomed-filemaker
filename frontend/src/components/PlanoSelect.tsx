'use client'

import React, { useState, useEffect, useRef } from 'react'
import { planosList } from '../utils/planos'

interface PlanoSelectProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  className?: string
  style?: React.CSSProperties
}

export default function PlanoSelect({ value, onChange, readOnly = false, className = '', style }: PlanoSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dropdownPosition, setDropdownPosition] = useState<'down' | 'up'>('down')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredPlanos = planosList.filter(plano =>
    plano.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleSelect = (plano: string) => {
    onChange(plano)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleInputClick = () => {
    if (!readOnly) {
      // Calculate dropdown position
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const spaceBelow = viewportHeight - rect.bottom
        const spaceAbove = rect.top
        
        // If less than 240px space below, render upwards
        setDropdownPosition(spaceBelow < 240 && spaceAbove > 240 ? 'up' : 'down')
      }
      
      setIsOpen(!isOpen)
      setSearchTerm('')
      console.log('PlanoSelect clicked, isOpen:', !isOpen, 'readOnly:', readOnly)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!readOnly) {
      setSearchTerm(e.target.value)
      setIsOpen(true)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm || value}
          onChange={handleInputChange}
          onClick={handleInputClick}
          readOnly={readOnly}
          className={className}
          style={style}
          placeholder={readOnly ? '' : 'Digite para buscar ou clique na seta'}
        />
        {!readOnly && (
          <button
            type="button"
            onClick={handleInputClick}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && !readOnly && (
        <div 
          className="absolute w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          style={{ 
            position: 'absolute',
            [dropdownPosition === 'up' ? 'bottom' : 'top']: dropdownPosition === 'up' ? '100%' : '100%',
            left: 0,
            right: 0,
            zIndex: 999999,
            marginTop: dropdownPosition === 'down' ? '4px' : '0',
            marginBottom: dropdownPosition === 'up' ? '4px' : '0'
          }}
        >
          {filteredPlanos.length > 0 ? (
            filteredPlanos.map((plano, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(plano)}
                className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm"
              >
                {plano}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">
              Nenhum plano encontrado
            </div>
          )}
        </div>
      )}
    </div>
  )
}
