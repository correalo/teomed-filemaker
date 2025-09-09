import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3004',
});

// Adicionar token de autenticação para requisições do servidor
api.interceptors.request.use((config) => {
  // Token válido para requisições do servidor
  config.headers.Authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzU5YjI4ZGJkYzY0YjJhNzc0NzFhZTciLCJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNzI1Mzk3NzI5LCJleHAiOjE3MjU0ODQxMjl9.Jj6Ew9YGjGGHZOULCzKUKOEfZGLSfhYqKBJJGAhPdyc';
  return config;
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pacienteId = searchParams.get('pacienteId');
    const nomePaciente = searchParams.get('nomePaciente');

    // Verificar se pelo menos um dos parâmetros foi fornecido
    if (!pacienteId && !nomePaciente) {
      return NextResponse.json({ error: 'pacienteId ou nomePaciente é obrigatório' }, { status: 400 });
    }

    // Construir a URL com os parâmetros disponíveis
    let url = '/evolucoes?';
    const params = [];
    
    if (pacienteId) {
      params.push(`pacienteId=${pacienteId}`);
    }
    
    if (nomePaciente) {
      params.push(`nome_paciente=${encodeURIComponent(nomePaciente)}`);
    }
    
    url += params.join('&');
    
    // Busca as evoluções do paciente no backend
    const response = await api.get(url);
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Erro ao buscar evoluções:', error);
    
    // Extrair informações mais detalhadas do erro com tipagem correta
    const errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido';
    const statusCode = error?.response?.status || 500;
    const searchParams = request.nextUrl.searchParams;
    const pacId = searchParams.get('pacienteId');
    
    const errorDetails = {
      message: errorMessage,
      status: statusCode,
      timestamp: new Date().toISOString(),
      path: `/api/evolucoes?pacienteId=${pacId || 'undefined'}`
    };
    
    console.error('Detalhes do erro:', errorDetails);
    
    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: statusCode }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Valida se o pacienteId foi fornecido
    if (!body.paciente_id) {
      return NextResponse.json({ error: 'paciente_id é obrigatório' }, { status: 400 });
    }

    // Envia a nova evolução para o backend
    const response = await api.post('/evolucoes', body);
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Erro ao criar evolução:', error);
    return NextResponse.json(
      { error: 'Erro ao criar evolução do paciente' },
      { status: 500 }
    );
  }
}
