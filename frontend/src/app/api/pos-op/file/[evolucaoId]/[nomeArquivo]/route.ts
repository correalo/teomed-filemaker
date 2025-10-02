import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3004'

export async function GET(
  request: NextRequest,
  { params }: { params: { evolucaoId: string; nomeArquivo: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    const response = await fetch(
      `${BACKEND_URL}/pos-op/file/${params.evolucaoId}/${params.nomeArquivo}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
    }

    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'application/octet-stream'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${params.nomeArquivo}"`,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar arquivo:', error)
    return NextResponse.json({ error: 'Erro ao buscar arquivo' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { evolucaoId: string; nomeArquivo: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    const response = await fetch(
      `${BACKEND_URL}/pos-op/file/${params.evolucaoId}/${params.nomeArquivo}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao remover arquivo:', error)
    return NextResponse.json({ error: 'Erro ao remover arquivo' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { evolucaoId: string; nomeArquivo: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const body = await request.json()

    const response = await fetch(
      `${BACKEND_URL}/pos-op/file/${params.evolucaoId}/${params.nomeArquivo}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao atualizar nome do arquivo:', error)
    return NextResponse.json({ error: 'Erro ao atualizar nome' }, { status: 500 })
  }
}
