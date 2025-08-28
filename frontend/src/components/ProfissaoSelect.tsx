'use client'

import React, { useState, useEffect, useRef } from 'react'
import { profissoesList } from '../utils/profissoes'

interface ProfissaoSelectProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  className?: string
  style?: React.CSSProperties
}

export default function ProfissaoSelect({ 
  value, 
  onChange, 
  readOnly = false, 
  className = '',
  style = {}
}: ProfissaoSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dropdownPosition, setDropdownPosition] = useState<'down' | 'up'>('down')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredProfissoes = profissoesList.filter((profissao: string) =>
    profissao.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleSelect = (profissao: string) => {
    onChange(profissao)
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
        readOnly={!isOpen && !readOnly}
        className={`${className} ${!readOnly ? 'cursor-pointer' : ''}`}
        style={style}
        placeholder={isOpen ? "Digite para buscar..." : "Selecione uma profissão"}
      />
      
      {isOpen && !readOnly && (
        <div
          className="absolute left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto"
          style={{
            top: dropdownPosition === 'down' ? '100%' : 'auto',
            bottom: dropdownPosition === 'up' ? '100%' : 'auto',
            marginTop: dropdownPosition === 'down' ? '4px' : '0',
            marginBottom: dropdownPosition === 'up' ? '4px' : '0'
          }}
        >
          {filteredProfissoes.length > 0 ? (
            filteredProfissoes.map((profissao: string, index: number) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(profissao)}
                className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm"
              >
                {profissao}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">
              Nenhuma profissão encontrada
            </div>
          )}
        </div>
      )}
    </div>
  )
}
