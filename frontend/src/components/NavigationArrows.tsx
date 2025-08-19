'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react'

interface NavigationArrowsProps {
  onPrevious: () => void
  onNext: () => void
  onJump: (steps: number) => void
  canGoPrevious: boolean
  canGoNext: boolean
  currentIndex: number
  total: number
}

export default function NavigationArrows({
  onPrevious,
  onNext,
  onJump,
  canGoPrevious,
  canGoNext,
  currentIndex,
  total,
}: NavigationArrowsProps) {
  const [showJumpMenu, setShowJumpMenu] = useState(false)

  const jumpOptions = [
    { label: '20', value: 20 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
  ]

  const handleJump = (steps: number, direction: 'forward' | 'backward') => {
    const jumpSteps = direction === 'forward' ? steps : -steps
    onJump(jumpSteps)
    setShowJumpMenu(false)
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Jump backward buttons */}
      <div className="relative">
        <button
          onClick={() => setShowJumpMenu(!showJumpMenu)}
          disabled={!canGoPrevious}
          className={`p-2 rounded-md border ${
            canGoPrevious
              ? 'bg-white border-filemaker-border hover:bg-filemaker-light-blue cursor-pointer'
              : 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
          }`}
          title="Pular múltiplos registros para trás"
        >
          <ChevronsLeft size={20} />
        </button>
        
        {showJumpMenu && canGoPrevious && (
          <div className="absolute bottom-full mb-2 left-0 bg-white border border-filemaker-border rounded-md shadow-lg z-10">
            <div className="p-2">
              <div className="text-xs text-filemaker-text mb-2 font-medium">Pular para trás:</div>
              {jumpOptions.map((option) => (
                <button
                  key={`back-${option.value}`}
                  onClick={() => handleJump(option.value, 'backward')}
                  disabled={currentIndex - option.value < 1}
                  className={`block w-full text-left px-3 py-1 text-sm rounded hover:bg-filemaker-light-blue ${
                    currentIndex - option.value < 1 ? 'text-gray-400 cursor-not-allowed' : 'text-filemaker-text'
                  }`}
                >
                  -{option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Single step backward */}
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className={`p-2 rounded-md border ${
          canGoPrevious
            ? 'bg-white border-filemaker-border hover:bg-filemaker-light-blue cursor-pointer'
            : 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
        }`}
        title="Registro anterior"
      >
        <ChevronLeft size={20} />
      </button>
      
      {/* Current position */}
      <span className="text-sm text-filemaker-text px-3 min-w-[80px] text-center">
        {currentIndex} / {total}
      </span>
      
      {/* Single step forward */}
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={`p-2 rounded-md border ${
          canGoNext
            ? 'bg-white border-filemaker-border hover:bg-filemaker-light-blue cursor-pointer'
            : 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
        }`}
        title="Próximo registro"
      >
        <ChevronRight size={20} />
      </button>

      {/* Jump forward buttons */}
      <div className="relative">
        <button
          onClick={() => setShowJumpMenu(!showJumpMenu)}
          disabled={!canGoNext}
          className={`p-2 rounded-md border ${
            canGoNext
              ? 'bg-white border-filemaker-border hover:bg-filemaker-light-blue cursor-pointer'
              : 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
          }`}
          title="Pular múltiplos registros para frente"
        >
          <ChevronsRight size={20} />
        </button>
        
        {showJumpMenu && canGoNext && (
          <div className="absolute bottom-full mb-2 right-0 bg-white border border-filemaker-border rounded-md shadow-lg z-10">
            <div className="p-2">
              <div className="text-xs text-filemaker-text mb-2 font-medium">Pular para frente:</div>
              {jumpOptions.map((option) => (
                <button
                  key={`forward-${option.value}`}
                  onClick={() => handleJump(option.value, 'forward')}
                  disabled={currentIndex + option.value > total}
                  className={`block w-full text-left px-3 py-1 text-sm rounded hover:bg-filemaker-light-blue ${
                    currentIndex + option.value > total ? 'text-gray-400 cursor-not-allowed' : 'text-filemaker-text'
                  }`}
                >
                  +{option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Jump to specific position */}
      <div className="relative">
        <button
          className="p-2 rounded-md border bg-white border-filemaker-border hover:bg-filemaker-light-blue cursor-pointer"
          onClick={() => {
            const position = prompt(`Ir para registro (1-${total}):`)
            if (position && !isNaN(Number(position))) {
              const targetIndex = Math.max(1, Math.min(total, Number(position)))
              onJump(targetIndex - currentIndex)
            }
          }}
          title="Ir para registro específico"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>
  )
}
