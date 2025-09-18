import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Obter o termo de busca da URL
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    
    // Obter o token de autorização do header
    const authHeader = request.headers.get('authorization');
    
    // Construir a URL para o backend
    const url = `http://localhost:3004/pacientes/autocomplete/nomes?q=${encodeURIComponent(query)}`;
    
    // Fazer a requisição para o backend
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao buscar sugestões de nomes' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro no proxy de autocomplete de nomes:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
