# Módulo de Evoluções - TEOMED

## Visão Geral

O módulo de Evoluções foi implementado para permitir o acompanhamento pós-operatório dos pacientes no sistema TEOMED. Este módulo está integrado ao Portal Section, exibido ao lado da foto do paciente, e permite visualizar e filtrar evoluções por paciente.

## Estrutura da Implementação

### Backend

#### Modelo de Dados (Schema)
- `paciente_id`: ID do paciente relacionado
- `nome_paciente`: Nome do paciente para referência rápida
- `data_retorno`: Data da consulta de retorno
- `delta_t`: Tempo decorrido desde a cirurgia
- `peso`: Peso atual do paciente em kg
- `delta_peso`: Variação de peso desde a última consulta
- `exames_alterados`: Descrição dos exames que apresentaram alterações
- `medicacoes`: Lista de medicações prescritas

#### API Endpoints
- `GET /evolucoes`: Lista todas as evoluções
- `GET /evolucoes?pacienteId=123`: Filtra evoluções por ID do paciente
- `POST /evolucoes`: Cria uma nova evolução
- `PUT /evolucoes/:id`: Atualiza uma evolução existente
- `DELETE /evolucoes/:id`: Remove uma evolução
- `GET /evolucoes/search`: Endpoint de busca com suporte a filtros

> **Importante**: A URL correta para acessar as evoluções no backend é `/evolucoes?pacienteId=123`. No frontend, as chamadas devem usar a instância API centralizada: `api.get('/evolucoes', { params: { pacienteId: 123 } })`

### Frontend

#### Componentes
- `PortalSection`: Componente principal que exibe as abas, incluindo a aba de Evoluções
- `EvolucoesTab`: Renderiza as evoluções do paciente em formato de cards
- `EvolucaoCard`: Exibe os detalhes de uma evolução individual
- `PacienteCard`: Gerencia as evoluções do paciente através do método `handleUpdateEvolucoes`

#### Integração
- As evoluções são carregadas dinamicamente quando o paciente é alterado
- A aba de Evoluções é ativada por padrão ao abrir o PortalSection
- Suporte completo ao modo de busca com campos específicos para filtrar evoluções
- Estilo visual consistente com o padrão FileMaker do sistema
- Todas as chamadas de API usam a instância Axios centralizada (`api`) para garantir autenticação consistente

## Funcionalidades

### Visualização de Evoluções
- Exibição em formato de cards com informações organizadas
- Formatação de datas no padrão brasileiro (dd/MM/yyyy)
- Exibição clara de peso, delta de peso e medicações

### Modo de Busca
- Campos de busca com estilo laranja (#fef3e2) quando em modo de busca
- Filtros para:
  - Data de retorno
  - Delta T (tempo desde a cirurgia)
  - Peso
  - Exames alterados
  - Medicações

### Integração com Pacientes
- Atualização automática das evoluções quando o paciente selecionado muda
- Consistência visual com outros componentes do sistema

## Implementação Técnica

### Tecnologias Utilizadas
- **Backend**: NestJS, MongoDB/Mongoose
- **Frontend**: React, React Query, Tailwind CSS
- **Formatação de Datas**: date-fns com locale pt-BR

### Detalhes de Implementação
- Queries otimizadas para MongoDB com suporte a regex para buscas parciais
- Debouncing nas entradas de busca para evitar excesso de requisições
- Uso de React Query para cache e revalidação de dados
- Tratamento adequado de arrays para medicações
- Instância Axios centralizada em `src/utils/api.ts` com baseURL para `http://localhost:3005`
- Interceptor para adicionar token JWT de autenticação aos headers apenas no cliente (browser)
- Rotas API Next.js no frontend que atuam como proxy para o backend, evitando problemas com localStorage no servidor

## Testes e Validação
- Script de seed para criar dados de exemplo para testes
- Testes manuais de integração com o módulo de pacientes
- Verificação de comportamento correto no modo de busca

## Próximos Passos
- Implementação de formulário para adicionar/editar evoluções
- Integração com módulo de gráficos para visualizar evolução do peso
- Melhorias na exibição de medicações com categorização
- Implementar testes automatizados para garantir o funcionamento correto das chamadas de API
- Adicionar tratamento de erros mais robusto nas chamadas de API

## Conclusão
O módulo de Evoluções foi implementado com sucesso, permitindo o acompanhamento pós-operatório dos pacientes no sistema TEOMED, com suporte completo ao modo de busca e integração com o módulo de pacientes.
