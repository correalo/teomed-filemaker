import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { pacienteId: string } }
) {
  try {
    const pacienteId = params.pacienteId;

    if (!pacienteId) {
      return NextResponse.json(
        { error: 'ID do paciente é obrigatório' },
        { status: 400 }
      );
    }

    // Obter o token de autorização do header
    const authHeader = request.headers.get('authorization');

    // Fazer a requisição para o backend
    const response = await fetch(
      `http://localhost:3004/avaliacoes/paciente/${pacienteId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { 'Authorization': authHeader } : {})
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao buscar avaliações do paciente' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro no proxy de avaliações:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
