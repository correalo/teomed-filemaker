import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3004'

export async function POST(
  request: NextRequest,
  { params }: { params: { pacienteId: string; evolucaoId: string } }
) {
  try {
    console.log('POST /api/pos-op/upload - Params:', params)
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const formData = await request.formData()
    
    console.log('Enviando para backend:', `${BACKEND_URL}/pos-op/upload/${params.pacienteId}/${params.evolucaoId}`)

    const response = await fetch(
      `${BACKEND_URL}/pos-op/upload/${params.pacienteId}/${params.evolucaoId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro no upload:', errorText)
      return NextResponse.json(
        { error: 'Erro ao fazer upload' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao fazer upload:', error)
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
  }
}
