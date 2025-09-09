# Correções na Busca de Evoluções - TEOMED

## Problema Identificado

O sistema TEOMED apresentava problemas na busca e exibição das evoluções dos pacientes devido a inconsistências entre:

1. Como o ID do paciente era referenciado no frontend (`pacienteId`)
2. Como o ID do paciente era armazenado no banco de dados (`paciente_id`)
3. Como o MongoDB compara IDs de diferentes tipos (ObjectId vs String)

## Soluções Implementadas

### 1. Correção dos Parâmetros de URL

- Modificamos o componente `PortalSection.tsx` para usar `paciente_id` em vez de `pacienteId` na URL
- Modificamos o componente `PacienteCard.tsx` para usar `paciente_id` em vez de `pacienteId` na URL

### 2. Garantia de Conversão para String

- Adicionamos conversão explícita para string no `PacienteCard.tsx`:
  ```typescript
  params.push(`paciente_id=${String(paciente._id)}`);
  ```

- Adicionamos conversão explícita para string no `PortalSection.tsx`:
  ```typescript
  params.push(`paciente_id=${String(pacienteId)}`);
  ```

### 3. Melhoria na Comparação de IDs no Backend

- Modificamos o método `search` no `evolucoes.service.ts` para lidar corretamente com IDs em diferentes formatos:
  ```typescript
  if (searchFields.paciente_id) {
    try {
      const mongoose = require('mongoose');
      // Tentar converter para ObjectId se for uma string válida de ObjectId
      if (mongoose.Types.ObjectId.isValid(searchFields.paciente_id)) {
        orConditions.push({ paciente_id: searchFields.paciente_id });
        // Também adicionar a versão string para garantir compatibilidade
        orConditions.push({ paciente_id: searchFields.paciente_id.toString() });
      } else {
        // Se não for um ObjectId válido, buscar pela string diretamente
        orConditions.push({ paciente_id: searchFields.paciente_id });
      }
    } catch (error) {
      // Em caso de erro, usar a string diretamente
      orConditions.push({ paciente_id: searchFields.paciente_id });
    }
  }
  ```

## Detalhes Técnicos

### Fluxo de Dados

1. O frontend obtém o `_id` do paciente do objeto paciente carregado via API
2. Ao buscar evoluções, o frontend converte esse ID para string e o envia como `paciente_id` na URL
3. O backend recebe o parâmetro `paciente_id` e tenta buscar evoluções usando tanto o formato ObjectId quanto string
4. O MongoDB encontra as evoluções correspondentes independentemente do formato do ID

### Compatibilidade

- O backend continua aceitando tanto `pacienteId` quanto `paciente_id` para manter compatibilidade
- A solução garante que IDs em diferentes formatos (ObjectId ou string) funcionem corretamente

## Testes Realizados

1. Verificação da estrutura do objeto paciente no frontend e backend
2. Confirmação de que o `_id` do paciente está sendo convertido corretamente para string
3. Teste do frontend para verificar se as evoluções estão sendo exibidas corretamente
4. Verificação dos logs do backend para confirmar que as queries estão sendo executadas corretamente

## Conclusão

Estas correções garantem que as evoluções sejam encontradas corretamente para todos os pacientes, usando o mesmo nome de campo que está no banco de dados (`paciente_id`), e lidando adequadamente com diferentes formatos de ID, mantendo a consistência entre frontend e backend.
