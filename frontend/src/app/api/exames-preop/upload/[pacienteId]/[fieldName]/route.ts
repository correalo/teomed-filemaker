import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { pacienteId: string; fieldName: string } }
) {
  try {
    const pacienteId = params.pacienteId;
    const fieldName = params.fieldName;
    
    console.log(`[exames-preop-upload] Recebida requisição de upload para paciente ${pacienteId}, campo ${fieldName}`);

    if (!pacienteId || !fieldName) {
      console.error('[exames-preop-upload] Parâmetros inválidos');
      return NextResponse.json(
        { error: 'ID do paciente e nome do campo são obrigatórios' },
        { status: 400 }
      );
    }

    // Obter o token de autorização do header
    const authHeader = request.headers.get('authorization');
    console.log(`[exames-preop-upload] Token presente: ${!!authHeader}`);

    // Obter o formulário com os arquivos
    const formData = await request.formData();
    
    // Log de todos os campos recebidos
    console.log('[exames-preop-upload] Campos recebidos no FormData:');
    // Usar Array.from para evitar erro de iteração
    Array.from(formData.entries()).forEach(([key, value]) => {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });
    
    // Criar um novo FormData para enviar ao backend
    const backendFormData = new FormData();
    
    // Na API de exames-preop, precisamos enviar com o nome 'file' (singular)
    // O PortalSection.tsx envia como 'files' (plural), então precisamos ajustar
    const files = formData.getAll('files');
    
    console.log(`[exames-preop-upload] Número de arquivos recebidos: ${files.length}`);
    
    if (files && files.length > 0) {
      // Pegamos apenas o primeiro arquivo para exames-preop (que só aceita um arquivo por campo)
      const firstFile = files[0];
      if (firstFile instanceof File) {
        console.log(`[exames-preop-upload] Enviando arquivo: ${firstFile.name}`);
        backendFormData.append('file', firstFile);
      } else {
        console.error('[exames-preop-upload] Primeiro item não é um arquivo válido');
        return NextResponse.json(
          { error: 'Arquivo inválido' },
          { status: 400 }
        );
      }
      
      // Copiar os outros campos como observações, etc.
      Array.from(formData.entries()).forEach(([key, value]) => {
        if (key !== 'files') {
          backendFormData.append(key, value as string);
        }
      });
    } else {
      console.error('[exames-preop-upload] Nenhum arquivo recebido');
      return NextResponse.json(
        { error: 'Nenhum arquivo foi enviado' },
        { status: 400 }
      );
    }

    // Fazer a requisição para o backend
    console.log(`[exames-preop-upload] Enviando para backend: http://localhost:3004/exames-preop/upload/${pacienteId}/${fieldName}`);
    const response = await fetch(
      `http://localhost:3004/exames-preop/upload/${pacienteId}/${fieldName}`,
      {
        method: 'POST',
        headers: {
          ...(authHeader ? { 'Authorization': authHeader } : {})
        },
        body: backendFormData,
      }
    );
    
    console.log(`[exames-preop-upload] Resposta do backend: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[exames-preop-upload] Erro do backend: ${errorText}`);
      return NextResponse.json(
        { error: `Erro ao fazer upload: ${errorText}`, status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[exames-preop-upload] Upload concluído com sucesso');
    return NextResponse.json(data);
  } catch (error) {
    console.error('[exames-preop-upload] Erro no proxy de upload:', error);
    if (error instanceof Error) {
      console.error('[exames-preop-upload] Detalhes do erro:', error.message, error.stack);
    }
    return NextResponse.json(
      { error: 'Erro interno no servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
