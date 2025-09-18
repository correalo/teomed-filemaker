import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar os dados de entrada
    if (!body.username || !body.password) {
      return NextResponse.json(
        { error: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      );
    }
    
    console.log('Tentando login com:', { username: body.username });
    
    // Fazer a chamada para o backend
    const response = await fetch('http://localhost:3004/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // Tratar resposta com erro
    if (!response.ok) {
      let errorMessage = 'Falha na autenticação';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        console.error('Erro ao analisar resposta de erro:', parseError);
      }
      
      console.error('Erro de login:', { status: response.status, message: errorMessage });
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }
    
    // Processar resposta bem-sucedida
    const data = await response.json();
    console.log('Login bem-sucedido');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na rota de login:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
