import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { pacienteId: string; fieldName: string; fileName: string } }
) {
  try {
    const { pacienteId, fieldName, fileName } = params;
    
    console.log('GET file route - params:', { pacienteId, fieldName, fileName });
    
    // Obter o token de autorização do header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autenticação não fornecido' },
        { status: 401 }
      );
    }
    
    // Decodificar o fileName para garantir que caracteres especiais sejam tratados corretamente
    const decodedFileName = decodeURIComponent(fileName);
    console.log('Decoded fileName:', decodedFileName);
    
    // Fazer a requisição para o backend
    const backendUrl = `http://localhost:3004/exames-preop/file/${pacienteId}/${fieldName}/${encodeURIComponent(decodedFileName)}`;
    console.log('Backend URL:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
      // Aumentar timeout para arquivos grandes
      signal: AbortSignal.timeout(30000), // 30 segundos
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', { status: response.status, error: errorText });
      return NextResponse.json(
        { error: `Erro ao buscar arquivo: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }
    
    // Obter o tipo de conteúdo e o nome do arquivo
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition = response.headers.get('content-disposition') || '';
    
    // Usar streaming para arquivos grandes
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', contentDisposition);
    
    // Retornar o stream diretamente
    return new NextResponse(response.body, {
      headers,
    });
  } catch (error) {
    console.error('Erro na rota de arquivo de exame pré-operatório:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        error: 'Erro interno no servidor',
        message: error instanceof Error ? error.message : String(error)
      },
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
      `http://localhost:3004/exames-preop/file/${pacienteId}/${fieldName}/${fileName}`,
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
    console.error('Erro na rota de exclusão de arquivo de exame pré-operatório:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
