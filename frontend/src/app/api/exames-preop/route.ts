import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Obter o token de autorização do header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autenticação não fornecido' },
        { status: 401 }
      );
    }
    
    // Fazer a requisição para o backend
    const response = await fetch('http://localhost:3004/exames-preop', {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Erro ao buscar exames pré-operatórios: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na rota de exames pré-operatórios:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
