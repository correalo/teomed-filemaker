import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { pacienteId: string } }
) {
  try {
    const pacienteId = params.pacienteId;
    console.log(`[exames-preop] Recebida requisição para paciente: ${pacienteId}`);
    
    // Obter o token de autorização do header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      console.error('[exames-preop] Token de autenticação não fornecido');
      return NextResponse.json(
        { error: 'Token de autenticação não fornecido', success: false },
        { status: 401 }
      );
    }
    
    // Verificar formato do token
    if (!authHeader.startsWith('Bearer ')) {
      console.error('[exames-preop] Formato de token inválido');
      return NextResponse.json(
        { error: 'Formato de token inválido. Use Bearer {token}', success: false },
        { status: 401 }
      );
    }
    
    // Extrair o token para diagnóstico
    const token = authHeader.split(' ')[1];
    if (!token || token.length < 10) { // Uma verificação básica 
      console.error('[exames-preop] Token vazio ou muito curto');
      return NextResponse.json(
        { error: 'Token inválido', success: false },
        { status: 401 }
      );
    }
    
    console.log(`[exames-preop] Token parece válido, comprimento: ${token.length}`)
    
    // Fazer a requisição para o backend
    // Fazer a requisição para o backend diretamente (sem proxy)
    console.log(`[exames-preop] Fazendo requisição para backend: http://localhost:3004/exames-preop/paciente/${pacienteId}`);
    const response = await fetch(`http://localhost:3004/exames-preop/paciente/${pacienteId}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    console.log(`[exames-preop] Status da resposta do backend: ${response.status}`);
    
    if (response.status === 404) {
      // Se não encontrar exame para o paciente, retornar nulo em vez de erro
      // Isso é comportamento normal para pacientes sem exames cadastrados
      console.log('[exames-preop] Nenhum exame encontrado para o paciente (404), retornando null');
      return NextResponse.json(null);
    }
    
    if (response.status === 401 || response.status === 403) {
      console.error(`[exames-preop] Erro de autorização: ${response.status}`);
      return NextResponse.json(
        { error: 'Acesso não autorizado. Verifique seu token de autenticação.' },
        { status: response.status }
      );
    }
    
    if (!response.ok) {
      console.error(`[exames-preop] Erro ao buscar exames pré-operatórios: ${response.status}`);
      
      // Em caso de erro, simplesmente retornar um objeto nulo bem formado 
      // para evitar que o frontend tente processar um JSON inválido
      if (response.status === 401 || response.status === 403) {
        console.log('[exames-preop] Erro de autenticação, retornando resposta consistente');
        return NextResponse.json(
          { 
            error: 'Não autorizado. Verifique se está autenticado.',
            details: { status: response.status },
            timestamp: new Date().toISOString(),
            data: null,
            success: false
          },
          { status: 401 }
        );
      }
      
      // Para o caso de erros 500 ou outros, retornar um objeto JSON válido 
      // que o frontend pode processar sem problemas
      console.log('[exames-preop] Erro no servidor, retornando resposta segura');
      return NextResponse.json(
        { 
          error: `Erro no servidor ao buscar exames pré-operatórios`,
          status: response.status,
          timestamp: new Date().toISOString(),
          data: null,
          success: false
        },
        { status: 500 }
      );
    }
    
    // Tratar resposta com cuidado para evitar erros de parsing
    try {
      // Verificar se o content-type é application/json
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('[exames-preop] Resposta processada com sucesso:', typeof data);
        return NextResponse.json(data);
      } else {
        // Se não for JSON, tratar como texto
        const text = await response.text();
        console.log('[exames-preop] Resposta não é JSON, recebido:', text.substring(0, 100));
        return NextResponse.json({ 
          data: null, 
          message: 'Resposta não é JSON',
          success: true // Mesmo assim consideramos sucesso, já que a requisição foi bem-sucedida
        });
      }
    } catch (parseError) {
      console.error('[exames-preop] Erro ao processar resposta:', parseError);
      return NextResponse.json({
        data: null,
        error: 'Erro ao processar resposta do servidor',
        success: false
      }, { status: 200 }); // Status 200 com dados de erro estruturados é melhor que 500
    }
  } catch (error) {
    // Capturar qualquer erro não tratado no try-catch acima
    console.error('[exames-preop] Erro não tratado na rota:', error);
    
    // Obter mais detalhes do erro
    let errorMessage = 'Erro interno no servidor';
    let errorDetails = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        stack: error.stack
        // Nota: propriedade 'cause' removida pois requer ES2022+
      };
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (typeof error === 'object' && error !== null) {
      errorDetails = error;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
