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
  const [showJumpModal, setShowJumpModal] = useState(false)
  const [jumpValue, setJumpValue] = useState('')

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

  const handleJumpToPosition = () => {
    const position = parseInt(jumpValue) || 0
    if (position >= 1 && position <= total) {
      const jumpSteps = position - currentIndex
      onJump(jumpSteps)
      setShowJumpModal(false)
      setJumpValue('')
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Jump backward buttons */}
      <div className="relative">
        <button
          onClick={() => setShowJumpMenu(!showJumpMenu)}
          disabled={!canGoPrevious}
          className={`p-2 rounded-lg border transition-all duration-200 ${
            canGoPrevious
              ? 'bg-white/90 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer shadow-sm hover:shadow-md'
              : 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
          }`}
          title="Pular múltiplos registros para trás"
        >
          <ChevronsLeft size={20} />
        </button>
        
        {showJumpMenu && canGoPrevious && (
          <div className="absolute top-full mt-2 left-0 bg-white border border-filemaker-border rounded-md shadow-lg z-10">
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
        className={`p-2 rounded-lg border transition-all duration-200 ${
          canGoPrevious
            ? 'bg-white/90 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer shadow-sm hover:shadow-md'
            : 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
        }`}
        title="Registro anterior"
      >
        <ChevronLeft size={20} />
      </button>
      
      {/* Current position */}
      <span className="text-sm text-white font-medium px-3 min-w-[80px] text-center bg-blue-500/20 rounded-lg py-1 backdrop-blur-sm">
        {currentIndex} / {total}
      </span>
      
      {/* Single step forward */}
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={`p-2 rounded-lg border transition-all duration-200 ${
          canGoNext
            ? 'bg-white/90 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer shadow-sm hover:shadow-md'
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
          <div className="absolute top-full mt-2 right-0 bg-white border border-filemaker-border rounded-md shadow-lg z-10">
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
          className="p-2 rounded-lg border bg-white/90 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
          onClick={() => setShowJumpModal(true)}
          title="Ir para registro específico"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Modal para ir para registro específico */}
      {showJumpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-80 rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Ir para Registro
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Digite o número do registro (1 a {total}):
            </p>
            <input
              type="number"
              min="1"
              max={total}
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              placeholder={`1 - ${total}`}
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowJumpModal(false)
                  setJumpValue('')
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleJumpToPosition}
                disabled={!jumpValue || (parseInt(jumpValue) || 0) < 1 || (parseInt(jumpValue) || 0) > total}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Ir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
