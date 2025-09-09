import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3004',
});

// No interceptor de requisição no lado do servidor
// Não podemos acessar localStorage aqui, pois estamos no servidor
// O token será enviado pelo cliente nas requisições

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json({ error: 'ID do paciente é obrigatório' }, { status: 400 });
    }

    // Busca os dados do paciente no backend
    const response = await api.get(`/pacientes/${id}`);
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar dados do paciente:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do paciente' },
      { status: 500 }
    );
  }
}
