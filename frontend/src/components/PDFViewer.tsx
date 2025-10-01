'use client'

import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

// Configurar worker do PDF.js - versão compatível com react-pdf 7.7.3
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PDFViewerProps {
  file: string
  fileName?: string
}

export default function PDFViewer({ file, fileName }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setPageNumber(1)
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => prevPageNumber + offset)
  }

  function previousPage() {
    changePage(-1)
  }

  function nextPage() {
    changePage(1)
  }

  function zoomIn() {
    setScale(prev => Math.min(prev + 0.2, 3.0))
  }

  function zoomOut() {
    setScale(prev => Math.max(prev - 0.2, 0.5))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controles */}
      <div className="bg-gray-100 p-3 border-b border-gray-300 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
          >
            ← Anterior
          </button>
          <span className="text-sm">
            Página {pageNumber} de {numPages}
          </span>
          <button
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
          >
            Próxima →
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            −
          </button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            +
          </button>
        </div>
      </div>

      {/* Visualizador de PDF */}
      <div className="flex-1 overflow-auto bg-gray-200 p-4 flex justify-center">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          }
          error={
            <div className="text-center p-8">
              <p className="text-red-600 mb-2">Erro ao carregar PDF</p>
              <p className="text-sm text-gray-600">Tente abrir em nova aba</p>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  )
}
