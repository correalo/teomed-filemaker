# Debug: Erro 400 no Upload de Exames Pré-Operatórios

## ✅ PROBLEMA RESOLVIDO

O erro 400 (Bad Request) foi causado por incompatibilidade entre os nomes de campos usados no frontend e os aceitos pelo backend.

### Causa Raiz
- **Frontend** estava usando: `laboratoriais`, `colono`, `anatomia_patologica`, `tomografia`, `bioimpedancia`, `outros2`
- **Backend** aceita apenas: `exames`, `usg`, `eda`, `rx`, `ecg`, `eco`, `polissonografia`, `outros`

### Solução Aplicada
Atualizamos o PortalSection.tsx para usar os mesmos nomes de campos que o backend espera:
- `laboratoriais` → `exames`
- `colono` → `ecg` (ECG)
- `anatomia_patologica` → `rx` (RX de Tórax)
- `tomografia` → removido
- `bioimpedancia` → `polissonografia`
- `outros2` → removido
- Adicionado: `eco` (Ecocardiograma)

---

## Problema Original (Resolvido)

## Logs Implementados

Adicionamos logs detalhados em três camadas para diagnosticar o problema:

### 1. PortalSection.tsx (Frontend)
- Log do caminho da API sendo usado
- Log do número de arquivos no FormData
- Log do status da resposta
- Log detalhado de erros com tentativa de parse JSON

### 2. API Route (/api/exames-preop/upload/[pacienteId]/[fieldName]/route.ts)
- Log de recebimento da requisição com parâmetros
- Log de presença do token de autenticação
- Log detalhado de todos os campos do FormData recebido
- Log do número de arquivos recebidos
- Log do arquivo sendo enviado ao backend
- Log da resposta do backend
- Log de erros detalhados com stack trace

### 3. Backend (exames-preop.controller.ts)
- O backend espera um campo 'file' (singular) via FileInterceptor
- Aceita um parâmetro opcional 'observacoes' no body

## Fluxo de Dados

```
PortalSection.tsx
  └─> FormData com 'files' (plural)
      └─> /api/exames-preop/upload/{pacienteId}/{fieldName}
          └─> Converte 'files' para 'file' (singular)
              └─> http://localhost:3004/exames-preop/upload/{pacienteId}/{fieldName}
                  └─> Backend processa com FileInterceptor('file')
```

## Possíveis Causas do Erro 400

1. **Arquivo não está sendo enviado corretamente**
   - O FormData pode não conter arquivos
   - O arquivo pode não ser uma instância válida de File

2. **Problema de autenticação**
   - Token ausente ou inválido
   - Backend rejeitando a requisição antes de processar o arquivo

3. **Problema no formato do campo**
   - Backend esperando 'file' mas recebendo outro formato
   - Problema na conversão de 'files' para 'file' na API route

4. **Validação do backend**
   - Tamanho do arquivo excedendo o limite (50MB)
   - Tipo de arquivo não suportado
   - Campo fieldName inválido

## Como Usar os Logs

1. Abra o Console do navegador (F12)
2. Abra o terminal onde o backend está rodando
3. Tente fazer upload de um arquivo
4. Observe os logs em ordem:
   - `PortalSection:` - logs do componente React
   - `[exames-preop-upload]` - logs da API route do Next.js
   - Logs do backend NestJS

## Próximos Passos

Com os logs implementados, ao tentar fazer upload novamente, você verá exatamente:
- Quantos arquivos estão sendo enviados
- Se o token está presente
- Qual campo está faltando ou está incorreto
- A mensagem de erro exata do backend

Isso permitirá identificar precisamente onde está o problema no fluxo de upload.
