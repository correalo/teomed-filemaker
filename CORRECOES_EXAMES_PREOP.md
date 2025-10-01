# Correções no Sistema de Exames Pré-Operatórios

## Problema Corrigido
O sistema estava utilizando a coleção `exames` em vez da coleção correta `exames_preop` para os exames pré-operatórios.

## Alterações Realizadas

### 1. Correção das Rotas de API no Frontend

#### Rotas Antigas Corrigidas:
- `/api/exames/upload/[pacienteId]/[fieldName]/route.ts` → `/api/exames-preop/upload/[pacienteId]/[fieldName]/route.ts`
- `/api/exames/file/[pacienteId]/[fieldName]/[fileName]/route.ts` → `/api/exames-preop/file/[pacienteId]/[fieldName]/[fileName]/route.ts`
- `/api/exames/paciente/[pacienteId]/route.ts` → `/api/exames-preop/paciente/[pacienteId]/route.ts`

#### Novas Rotas Criadas:
- `/api/exames-preop/route.ts` - Para listar todos os exames pré-operatórios

### 2. Correção de Componentes e Hooks Frontend

#### Componentes Atualizados:
- `PortalSection.tsx`: 
  - Corrigido para usar a rota `exames-preop` em vez de `exames` 
  - Atualizado o mapeamento de active tab para usar as rotas corretas
  - Ajustado o parâmetro de refetchExame para incluir exames pré-operatórios

- `ExamePreopUploader.tsx`:
  - Implementado suporte para drag and drop
  - Interface melhorada para feedback visual

#### Hooks Atualizados:
- `useExames.ts`: Corrigido para usar as rotas `/api/exames-preop/...` em vez de `/api/exames/...`

### 3. Correções de Integração

#### Compatibilidade entre PortalSection e API de Exames:
- O PortalSection envia arquivos como 'files' (plural), enquanto a API de exames-preop espera 'file' (singular)
- Implementado adaptador na rota de API para ajustar os nomes dos campos

#### Tratamento de Erros:
- Melhorado o tratamento de erros 404 para retornar null em vez de erro (comportamento esperado para pacientes sem exames)
- Adicionado logging melhorado para diagnosticar problemas
- Tratamento mais detalhado de erros 500 para facilitar diagnóstico

### 4. Funcionalidades Adicionadas

#### Interface Drag and Drop:
- Design moderno com área dedicada para arrastar e soltar arquivos
- Feedback visual quando arquivo está sendo arrastado
- Exibição clara do arquivo selecionado com opção de remoção
- Suporte para clique para selecionar ou arrastar para soltar

## Como Testar

1. Acesse a seção "Exames Pré-Operatórios" de qualquer paciente
2. Verifique se é possível:
   - Arrastar e soltar arquivos na área de upload
   - Selecionar arquivos clicando na área
   - Ver o arquivo selecionado antes de fazer upload
   - Baixar arquivos previamente enviados
   - Remover arquivos existentes

## Observações Técnicas

- A estrutura da coleção `exames_preop` é diferente da `exames`:
  - `exames_preop` usa campos individuais para cada tipo de exame
  - `exames` usa arrays de arquivos por categoria
- O backend de `exames-preop` aceita apenas um arquivo por campo, enquanto o de `exames` aceita múltiplos arquivos
