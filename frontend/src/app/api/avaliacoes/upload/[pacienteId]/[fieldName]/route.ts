import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { pacienteId: string; fieldName: string } }
) {
  try {
    const pacienteId = params.pacienteId;
    const fieldName = params.fieldName;

    if (!pacienteId || !fieldName) {
      return NextResponse.json(
        { error: 'ID do paciente e nome do campo são obrigatórios' },
        { status: 400 }
      );
    }

    // Obter o token de autorização do header
    const authHeader = request.headers.get('authorization');

    // Obter o formulário com os arquivos
    const formData = await request.formData();
    
    // Criar um novo FormData para enviar ao backend
    const backendFormData = new FormData();
    
    // Copiar todos os arquivos e campos do formulário original
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value);
    }

    // Fazer a requisição para o backend
    const response = await fetch(
      `http://localhost:3004/avaliacoes/upload/${pacienteId}/${fieldName}`,
      {
        method: 'POST',
        headers: {
          ...(authHeader ? { 'Authorization': authHeader } : {})
        },
        body: backendFormData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Erro ao fazer upload: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro no proxy de upload de avaliações:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
