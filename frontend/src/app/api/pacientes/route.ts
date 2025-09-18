import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Obter os parâmetros da URL
    const searchParams = request.nextUrl.searchParams;
    const params = new URLSearchParams();
    
    // Copiar todos os parâmetros da requisição original
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });
    
    // Obter o token de autorização do header
    const authHeader = request.headers.get('authorization');
    
    // Construir a URL para o backend
    const url = `http://localhost:3004/pacientes?${params.toString()}`;
    
    // Fazer a requisição para o backend
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao buscar pacientes' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro no proxy de pacientes:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    
    const response = await fetch('http://localhost:3004/pacientes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao criar paciente' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro no proxy de pacientes:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
