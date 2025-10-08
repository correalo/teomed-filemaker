import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3004'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/evolucoes/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro ao atualizar evolução:', errorText)
      return NextResponse.json(
        { error: 'Erro ao atualizar evolução' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao atualizar evolução:', error)
    return NextResponse.json({ error: 'Erro ao atualizar evolução' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    const response = await fetch(`${BACKEND_URL}/evolucoes/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro ao deletar evolução:', errorText)
      return NextResponse.json(
        { error: 'Erro ao deletar evolução' },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar evolução:', error)
    return NextResponse.json({ error: 'Erro ao deletar evolução' }, { status: 500 })
  }
}
