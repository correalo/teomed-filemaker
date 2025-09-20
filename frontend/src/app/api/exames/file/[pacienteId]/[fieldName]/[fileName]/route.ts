import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { pacienteId: string; fieldName: string; fileName: string } }
) {
  try {
    const { pacienteId, fieldName, fileName } = params;
    
    // Obter o token de autorização do header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autenticação não fornecido' },
        { status: 401 }
      );
    }
    
    // Fazer a requisição para o backend
    const response = await fetch(
      `http://localhost:3004/exames/file/${pacienteId}/${fieldName}/${fileName}`,
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
        },
      }
    );
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Erro ao buscar arquivo: ${response.status}` },
        { status: response.status }
      );
    }
    
    // Obter o tipo de conteúdo e o nome do arquivo
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition = response.headers.get('content-disposition') || '';
    
    // Obter o buffer do arquivo
    const buffer = await response.arrayBuffer();
    
    // Retornar o arquivo como resposta
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
      },
    });
  } catch (error) {
    console.error('Erro na rota de arquivo de exame:', error);
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
    const { pacienteId, fieldName, fileName } = params;
    
    // Obter o token de autorização do header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autenticação não fornecido' },
        { status: 401 }
      );
    }
    
    // Fazer a requisição para o backend
    const response = await fetch(
      `http://localhost:3004/exames/file/${pacienteId}/${fieldName}/${fileName}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': authHeader,
        },
      }
    );
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Erro ao excluir arquivo: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na rota de exclusão de arquivo de exame:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
