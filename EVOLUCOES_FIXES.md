# Correções no Módulo de Evoluções - TEOMED

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

## Correção no Processamento do Campo Medicações

### Problema Identificado

O sistema TEOMED apresentava um erro de hydration ao salvar evoluções devido ao processamento inadequado do campo `medicacoes`. O erro ocorria porque:

1. O campo `medicacoes` é definido como um array de strings no modelo de dados
2. Em alguns casos, o campo estava sendo tratado como string durante a edição
3. Ao salvar, o sistema tentava enviar uma string para um campo que deveria ser um array

### Soluções Implementadas

#### 1. Correção do método `handleSaveEvolucao`

- Modificamos o método para garantir que o campo `medicacoes` seja sempre um array antes de enviar para o backend:

```typescript
const handleSaveEvolucao = async (index: number) => {
  const evolucao = editedEvolucoes[index]
  if (!evolucao._id) return

  setIsSaving(true)
  try {
    // Garantir que medicacoes seja sempre um array
    const evolucaoData = {
      ...evolucao,
      medicacoes: Array.isArray(evolucao.medicacoes) 
        ? evolucao.medicacoes 
        : (evolucao.medicacoes && typeof evolucao.medicacoes === 'string' 
            ? (evolucao.medicacoes as string).split(',').map(item => item.trim()) 
            : [])
    }
    
    await api.put(`/evolucoes/${evolucao._id}`, evolucaoData)
    // Resto do código...
  } catch (error: any) {
    // Tratamento de erro...
  }
}
```

#### 2. Melhoria no método `handleInputChange`

- Adicionamos tratamento especial para o campo `medicacoes` para converter strings em arrays durante a edição:

```typescript
const handleInputChange = (index: number, field: keyof Evolucao, value: any) => {
  const updatedEvolucoes = [...editedEvolucoes]
  
  // Tratamento especial para o campo medicacoes
  if (field === 'medicacoes' && typeof value === 'string') {
    updatedEvolucoes[index] = {
      ...updatedEvolucoes[index],
      [field]: value.split(',').map(item => item.trim())
    }
  } else {
    updatedEvolucoes[index] = {
      ...updatedEvolucoes[index],
      [field]: value
    }
  }
  
  setEditedEvolucoes(updatedEvolucoes)
}
```

### Detalhes Técnicos

- O campo `medicacoes` é definido como `string[]` na interface `Evolucao`
- Durante a edição, o usuário pode inserir valores separados por vírgula
- A correção garante que esses valores sejam convertidos em array antes de serem salvos
- O tratamento é feito tanto no momento da edição quanto no momento do salvamento

### Testes Realizados

1. Edição de uma evolução existente com medicações
2. Inserção de medicações como texto separado por vírgulas
3. Salvamento da evolução e verificação do formato no backend

## Conclusão

Estas correções garantem que:

1. As evoluções sejam encontradas corretamente para todos os pacientes, usando o mesmo nome de campo que está no banco de dados (`paciente_id`), e lidando adequadamente com diferentes formatos de ID
2. O campo `medicacoes` seja sempre processado corretamente como um array, evitando erros de hydration durante o salvamento
3. A experiência do usuário seja consistente, permitindo a entrada de medicações tanto como array quanto como texto separado por vírgulas
