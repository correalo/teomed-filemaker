import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json({ error: 'ID do paciente é obrigatório' }, { status: 400 });
    }

    // Obter o token de autorização do header
    const authHeader = request.headers.get('authorization');

    // Busca os dados do paciente no backend
    const response = await fetch(`http://localhost:3004/pacientes/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao buscar dados do paciente' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar dados do paciente:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    if (!id) {
      return NextResponse.json({ error: 'ID do paciente é obrigatório' }, { status: 400 });
    }

    // Encaminhar PATCH para o backend NestJS
    const response = await fetch(`http://localhost:3004/pacientes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: text || 'Erro ao atualizar paciente (PATCH)' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao atualizar paciente (PATCH):', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    if (!id) {
      return NextResponse.json({ error: 'ID do paciente é obrigatório' }, { status: 400 });
    }

    const response = await fetch(`http://localhost:3004/pacientes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao atualizar paciente' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const authHeader = request.headers.get('authorization');

    if (!id) {
      return NextResponse.json({ error: 'ID do paciente é obrigatório' }, { status: 400 });
    }

    const response = await fetch(`http://localhost:3004/pacientes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao excluir paciente' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir paciente:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
