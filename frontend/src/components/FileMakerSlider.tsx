'use client'

import { useEffect, useRef, useState } from 'react'

interface FileMakerSliderProps {
  currentIndex: number
  total: number
  onSlide: (index: number) => void
}

export default function FileMakerSlider({
  currentIndex,
  total,
  onSlide,
}: FileMakerSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [sliderValue, setSliderValue] = useState(currentIndex)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isDragging) setSliderValue(currentIndex)
  }, [currentIndex, isDragging])

  const max = Math.max(0, total - 1)
  const percentage = total > 1 ? (sliderValue / max) * 100 : 0

  // Atualiza o valor a partir da posição do ponteiro (clique/arraste no trilho)
  const updateFromPointer = (clientX: number) => {
    const el = inputRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const value = Math.round(pct * max)
    setSliderValue(value)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0
    setSliderValue(value)
    // enquanto não está arrastando, já notifica
    if (!isDragging) onSlide(value)
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLInputElement>) => {
    setIsDragging(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    updateFromPointer(e.clientX) // já salta pro ponto clicado
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLInputElement>) => {
    if (!isDragging) return
    updateFromPointer(e.clientX)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLInputElement>) => {
    setIsDragging(false)
    ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
    onSlide(sliderValue) // confirma valor ao soltar
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-md p-1 border border-gray-200 min-w-0">
      {/* Registro atual - Responsivo */}
      <div className="text-[10px] sm:text-xs font-medium text-gray-700 min-w-[32px] sm:min-w-[44px] text-right whitespace-nowrap">
        <span className="hidden sm:inline">{sliderValue + 1}/{total}</span>
        <span className="sm:hidden">{sliderValue + 1}</span>
      </div>

      {/* Barra deslizante responsiva */}
      <div className="flex-1 relative min-w-[80px] max-w-[200px]">
        <input
          ref={inputRef}
          type="range"
          min={0}
          max={max}
          step={1}
          value={sliderValue}
          onChange={handleChange}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="slider w-full h-4 sm:h-5 appearance-none cursor-pointer browser-optimized"
          style={{
            background: `linear-gradient(to right, #e5e7eb 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
            borderRadius: 9999,
          }}
          aria-label="Navegar pelos registros"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={sliderValue + 1}
          aria-valuetext={`${sliderValue + 1} de ${total}`}
        />
      </div>

      {/* Total compacto - Responsivo */}
      <div className="text-[8px] sm:text-[10px] text-gray-600 min-w-[24px] sm:min-w-[44px] text-right whitespace-nowrap">
        <span className="hidden sm:inline">{total} total</span>
        <span className="sm:hidden">{total}</span>
      </div>

      <style jsx>{`
        /* ===== CHROMIUM/CHROME OPTIMIZATIONS ===== */
        .slider::-webkit-slider-runnable-track {
          height: 5px;
          background: transparent;
          border-radius: 9999px;
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #ffffff;
          border-radius: 50%;
          cursor: grab;
          border: 2px solid #3b82f6;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: all 0.15s ease;
          margin-top: -5.5px;
        }
        
        /* Responsivo para mobile */
        @media (max-width: 640px) {
          .slider::-webkit-slider-thumb {
            width: 20px;
            height: 20px;
            margin-top: -7.5px;
            border: 3px solid #3b82f6;
          }
          .slider::-webkit-slider-runnable-track {
            height: 6px;
          }
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
          border-color: #2563eb;
        }
        
        .slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.2);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
          border-color: #1d4ed8;
        }

        /* ===== FIREFOX OPTIMIZATIONS ===== */
        .slider::-moz-range-track {
          height: 5px;
          background: transparent;
          border-radius: 9999px;
          border: none;
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #ffffff;
          border-radius: 50%;
          cursor: grab;
          border: 2px solid #3b82f6;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: all 0.15s ease;
        }
        
        @media (max-width: 640px) {
          .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border: 3px solid #3b82f6;
          }
          .slider::-moz-range-track {
            height: 6px;
          }
        }
        
        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
          border-color: #2563eb;
        }
        
        .slider::-moz-range-thumb:active {
          cursor: grabbing;
          transform: scale(1.2);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
          border-color: #1d4ed8;
        }

        /* ===== SAFARI/iOS OPTIMIZATIONS ===== */
        .slider {
          outline: none;
          touch-action: manipulation; /* iOS touch optimization */
          border-radius: 9999px;
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        
        /* iOS specific touch improvements */
        @supports (-webkit-touch-callout: none) {
          .slider {
            -webkit-appearance: none;
            background: transparent;
          }
          
          .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 22px;
            height: 22px;
            margin-top: -8px;
            border: 3px solid #3b82f6;
            background: #ffffff;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
          }
          
          .slider::-webkit-slider-runnable-track {
            height: 6px;
            background: transparent;
            border-radius: 9999px;
          }
        }
        
        /* Focus states for accessibility */
        .slider:focus-visible::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.35);
        }
        
        .slider:focus-visible::-moz-range-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.35);
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .slider::-webkit-slider-thumb {
            border-width: 3px;
            box-shadow: 0 0 0 1px #000;
          }
          
          .slider::-moz-range-thumb {
            border-width: 3px;
            box-shadow: 0 0 0 1px #000;
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .slider::-webkit-slider-thumb {
            transition: none;
          }
          
          .slider::-moz-range-thumb {
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}
