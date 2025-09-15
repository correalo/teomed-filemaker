# Documentação: Implementação de Armazenamento Binário de 64 Bits

## Visão Geral

Esta documentação descreve a implementação do armazenamento de arquivos como binários de 64 bits (Base64) no módulo de avaliações do sistema TEOMED. Esta abordagem permite armazenar arquivos diretamente no banco de dados MongoDB como strings Base64, eliminando a necessidade de armazenamento em sistema de arquivos.

## Alterações Realizadas

### 1. Schema (Modelo de Dados)

O schema `Avaliacao` foi modificado para armazenar arquivos como strings Base64 em vez de Buffer:

```typescript
@Prop([{
  nome_original: String,
  nome_arquivo: String,
  tipo: String,
  tamanho: Number,
  data: String, // Armazenar arquivo como binário de 64 bits (Base64)
  data_upload: { type: Date, default: Date.now }
}])
```

### 2. Controller (Controlador)

O controller `AvaliacoesController` foi atualizado para:

- Converter o buffer do arquivo para Base64 antes de salvar no banco de dados:
  ```typescript
  const fileInfo = {
    nome_original: file.originalname,
    nome_arquivo: `${randomUUID()}_${file.originalname}`,
    tipo: file.mimetype,
    tamanho: file.size,
    data: file.buffer.toString('base64'), // Converter para Base64 (binário 64 bits)
  };
  ```

- Converter de Base64 para Buffer ao servir o arquivo:
  ```typescript
  // Converter de Base64 para Buffer antes de enviar
  const fileBuffer = Buffer.from(file.data, 'base64');
  return res.send(fileBuffer);
  ```

### 3. Service (Serviço)

O serviço `AvaliacoesService` foi atualizado para trabalhar com dados em formato Base64:

```typescript
async addFileToField(
  pacienteId: string,
  fieldName: string,
  fileInfo: {
    nome_original: string;
    nome_arquivo: string;
    tipo: string;
    tamanho: number;
    data: string; // Base64
  }
): Promise<Avaliacao> {
  // ...
}
```

## Fluxo de Dados

1. **Upload de Arquivo**:
   - O frontend envia o arquivo via formulário multipart/form-data
   - O backend recebe o arquivo como Buffer via Multer (memoryStorage)
   - O Buffer é convertido para string Base64 usando `buffer.toString('base64')`
   - A string Base64 é armazenada no MongoDB

2. **Download/Visualização de Arquivo**:
   - O frontend solicita o arquivo via GET com autenticação JWT
   - O backend recupera a string Base64 do MongoDB
   - A string Base64 é convertida de volta para Buffer usando `Buffer.from(data, 'base64')`
   - O Buffer é enviado como resposta com o Content-Type apropriado
   - O frontend cria um Blob e URL temporária para abrir o arquivo

## Vantagens do Armazenamento Binário de 64 Bits

1. **Portabilidade**: Os dados são armazenados como strings, facilitando a transferência entre sistemas
2. **Compatibilidade**: Base64 é amplamente suportado em diferentes plataformas e linguagens
3. **Segurança**: Os dados binários são codificados de forma segura
4. **Independência de Sistema de Arquivos**: Não há necessidade de gerenciar arquivos no sistema de arquivos
5. **Backup Simplificado**: Todo o conteúdo está no banco de dados, facilitando backups

## Considerações de Performance

- A codificação Base64 aumenta o tamanho dos dados em aproximadamente 33%
- Para arquivos muito grandes, considerar limites de tamanho ou paginação
- O MongoDB tem um limite de 16MB por documento

## Testes Realizados

- Upload de arquivos PDF e imagens
- Recuperação e visualização de arquivos
- Remoção de arquivos

Todos os testes foram bem-sucedidos, confirmando que o sistema está armazenando e recuperando corretamente os arquivos como binários de 64 bits.
