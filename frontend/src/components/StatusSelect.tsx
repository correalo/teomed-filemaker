'use client'

import React, { useState, useEffect, useRef } from 'react'
import { STATUS_OPTIONS } from '../utils/status'

interface StatusSelectProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  className?: string
  style?: React.CSSProperties
}

export default function StatusSelect({ 
  value, 
  onChange, 
  readOnly = false, 
  className = '',
  style = {}
}: StatusSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dropdownPosition, setDropdownPosition] = useState<'down' | 'up'>('down')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredStatus = STATUS_OPTIONS.filter((status: string) =>
    status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (status: string) => {
    onChange(status)
    setIsOpen(false)
    setSearchTerm('')
  }

  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      
      if (spaceBelow < 200 && spaceAbove > spaceBelow) {
        setDropdownPosition('up')
      } else {
        setDropdownPosition('down')
      }
    }
  }

  const handleClick = () => {
    if (!readOnly) {
      updateDropdownPosition()
      
      setIsOpen(!isOpen)
      setSearchTerm('')
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        value={isOpen ? searchTerm : value}
        onChange={(e) => {
          if (isOpen) {
            setSearchTerm(e.target.value)
          }
        }}
        onClick={handleClick}
        readOnly={!isOpen}
        className={`${className} cursor-pointer pr-8`}
        style={style}
        placeholder={isOpen ? "Digite para buscar..." : "Selecione um status"}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isOpen && (
        <div
          className="absolute left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto"
          style={{
            top: dropdownPosition === 'down' ? '100%' : 'auto',
            bottom: dropdownPosition === 'up' ? '100%' : 'auto',
            marginTop: dropdownPosition === 'down' ? '4px' : '0',
            marginBottom: dropdownPosition === 'up' ? '4px' : '0'
          }}
        >
          {filteredStatus.length > 0 ? (
            filteredStatus.map((status: string, index: number) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(status)}
                className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm"
              >
                {status}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">
              Nenhum status encontrado
            </div>
          )}
        </div>
      )}
    </div>
  )
}
