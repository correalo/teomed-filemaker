'use client'

import React, { useState, useRef } from 'react'

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  onTranscriptionReceived?: (transcription: string) => void
  onAutoFillRequest?: (audioBlob: Blob) => Promise<void>
  disabled?: boolean
}

export default function AudioRecorder({ onRecordingComplete, onTranscriptionReceived, onAutoFillRequest, disabled = false }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastRecordedBlob, setLastRecordedBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      // Limpar blob anterior ao iniciar nova gravação
      setLastRecordedBlob(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setLastRecordedBlob(audioBlob)
        onRecordingComplete(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Erro ao acessar microfone:', error)
      alert('Erro ao acessar o microfone. Verifique as permissões.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
      setIsPaused(!isPaused)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAutoFill = async () => {
    if (!lastRecordedBlob || !onAutoFillRequest) return
    
    setIsProcessing(true)
    try {
      await onAutoFillRequest(lastRecordedBlob)
    } catch (error) {
      console.error('Erro ao processar áudio:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {!isRecording ? (
        <>
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            title="Iniciar gravação"
          >
            🎤
          </button>
          
          {lastRecordedBlob && onAutoFillRequest && (
            <button
              type="button"
              onClick={handleAutoFill}
              disabled={isProcessing || disabled}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              title="Preencher CRM automaticamente com IA"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </>
              ) : (
                <>
                  ✨ Preencher Automático
                </>
              )}
            </button>
          )}
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={pauseRecording}
            className={`${isPaused ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white p-2 rounded-full transition-colors shrink-0 flex items-center justify-center w-10 h-10`}
            title={isPaused ? "Retomar gravação" : "Pausar gravação"}
          >
            {isPaused ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={stopRecording}
            className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-full transition-colors shrink-0 flex items-center justify-center w-10 h-10"
            title="Parar gravação"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <rect x="5" y="5" width="10" height="10" rx="1" />
            </svg>
          </button>
          <span className="text-sm font-mono text-red-600 font-bold animate-pulse">
            ⏺ {formatTime(recordingTime)}
          </span>
        </>
      )}
    </div>
  )
}
