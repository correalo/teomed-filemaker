import { NextRequest, NextResponse } from 'next/server';

// Aumentar o timeout para 30 segundos para evitar erros 408
const TIMEOUT = 30000;

export async function GET(
  request: NextRequest,
  { params }: { params: { pacienteId: string; fieldName: string; fileName: string } }
) {
  try {
    const pacienteId = params.pacienteId;
    const fieldName = params.fieldName;
    const fileName = params.fileName;

    if (!pacienteId || !fieldName || !fileName) {
      return NextResponse.json(
        { error: 'ID do paciente, nome do campo e nome do arquivo são obrigatórios' },
        { status: 400 }
      );
    }

    // Obter o token de autorização do header
    const authHeader = request.headers.get('authorization');

    // Criar um AbortController para controlar o timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    
    let response;
    try {
      // Fazer a requisição para o backend com timeout
      response = await fetch(
        `http://localhost:3004/avaliacoes/file/${pacienteId}/${fieldName}/${fileName}`,
        {
          headers: {
            ...(authHeader ? { 'Authorization': authHeader } : {})
          },
          signal: controller.signal
        }
      );
    } catch (fetchError) {
      console.error('Erro durante o fetch:', fetchError);
      return NextResponse.json(
        { error: 'Erro de timeout ou conexão' },
        { status: 408 }
      );
    } finally {
      // Limpar o timeout em qualquer caso
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao obter arquivo' },
        { status: response.status }
      );
    }

    // Obter o tipo de conteúdo e o nome do arquivo original
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition = response.headers.get('content-disposition') || '';
    
    // Obter o buffer do arquivo
    const buffer = await response.arrayBuffer();

    // Retornar a resposta com os headers corretos
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
      },
    });
  } catch (error) {
    console.error('Erro no proxy de obtenção de arquivo:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { pacienteId: string; fieldName: string; fileName: string } }
) {
  try {
    const pacienteId = params.pacienteId;
    const fieldName = params.fieldName;
    const fileName = params.fileName;

    if (!pacienteId || !fieldName || !fileName) {
      return NextResponse.json(
        { error: 'ID do paciente, nome do campo e nome do arquivo são obrigatórios' },
        { status: 400 }
      );
    }

    // Obter o token de autorização do header
    const authHeader = request.headers.get('authorization');

    // Fazer a requisição para o backend
    const response = await fetch(
      `http://localhost:3004/avaliacoes/file/${pacienteId}/${fieldName}/${fileName}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { 'Authorization': authHeader } : {})
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao excluir arquivo' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no proxy de exclusão de arquivo:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
