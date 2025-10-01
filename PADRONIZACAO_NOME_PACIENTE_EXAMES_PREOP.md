# Padronização: Nome do Paciente em Exames Pré-Operatórios

## Objetivo

Seguir o mesmo padrão da coleção `avaliacoes` na coleção `exames_preop`, incluindo o campo `nome_paciente` para facilitar consultas e manter consistência no banco de dados.

## Análise das Estruturas

### Avaliações (avaliacoes) - Estrutura Atual ✅
```javascript
{
  _id: ObjectId,
  paciente_id: "68d2c95859fc321f1b390eea",
  nome_paciente: "MARIA SILVA",  // ✅ Campo presente
  data_criacao: Date,
  data_atualizacao: Date,
  cardiologista: Array,
  endocrino: Array,
  nutricionista: Array,
  psicologa: Array,
  outros: Array
}
```

### Exames Pré-Op (exames_preop) - Estrutura Anterior ❌
```javascript
{
  _id: ObjectId,
  paciente_id: "68d2c95859fc321f1b390eea",
  // ❌ Campo nome_paciente estava faltando
  data_cadastro: Date,
  status: "pendente",
  observacoes_geral: "",
  exames: Object,
  usg: Object,
  // ... outros campos
}
```

### Exames Pré-Op (exames_preop) - Estrutura Corrigida ✅
```javascript
{
  _id: ObjectId,
  paciente_id: "68d2c95859fc321f1b390eea",
  nome_paciente: "MARIA SILVA",  // ✅ Campo adicionado
  data_cadastro: Date,
  status: "pendente",
  observacoes_geral: "",
  exames: Object,
  usg: Object,
  // ... outros campos
}
```

## Alterações Implementadas

### 1. Backend - exames-preop.service.ts

**Importações adicionadas:**
```typescript
import { Paciente, PacienteDocument } from '../schemas/paciente.schema';
```

**Constructor atualizado:**
```typescript
constructor(
  @InjectModel(ExamePreop.name) private examePreopModel: Model<ExamePreopDocument>,
  @InjectModel(Paciente.name) private pacienteModel: Model<PacienteDocument>  // ✅ Adicionado
) {}
```

**Método uploadFile atualizado:**
```typescript
if (!examePreop) {
  // Buscar dados do paciente para obter o nome
  const paciente = await this.pacienteModel.findById(pacienteId).exec();
  if (!paciente) {
    throw new NotFoundException(`Paciente com ID ${pacienteId} não encontrado`);
  }
  
  // Criar novo exame para o paciente com nome_paciente
  const newExamePreop = new this.examePreopModel({
    paciente_id: pacienteId,
    nome_paciente: paciente.nome,  // ✅ Nome do paciente incluído
    data_cadastro: new Date()
  });
  examePreop = await newExamePreop.save();
}
```

### 2. Backend - exames-preop.module.ts

**Importações adicionadas:**
```typescript
import { Paciente, PacienteSchema } from '../schemas/paciente.schema';
```

**MongooseModule.forFeature atualizado:**
```typescript
MongooseModule.forFeature([
  { name: ExamePreop.name, schema: ExamePreopSchema },
  { name: Paciente.name, schema: PacienteSchema }  // ✅ Schema do Paciente registrado
])
```

### 3. Frontend - PortalSection.tsx

O campo "Nome do Paciente" já estava implementado na interface:
```typescript
<div className="mb-4">
  <label className="block text-xs font-medium text-filemaker-text mb-1">
    NOME DO PACIENTE
  </label>
  <input
    type="text"
    value={pacienteNome}
    readOnly
    className="filemaker-input w-full text-sm bg-gray-100"
  />
</div>
```

## Benefícios

✅ **Consistência no Banco de Dados**
- Ambas as coleções (avaliacoes e exames_preop) seguem o mesmo padrão

✅ **Facilidade de Consultas**
- Possível buscar exames pré-op pelo nome do paciente diretamente
- Não é necessário fazer JOIN com a coleção de pacientes

✅ **Melhor Rastreabilidade**
- Dados históricos mantêm o nome do paciente mesmo se ele for alterado posteriormente

✅ **Performance**
- Consultas mais rápidas ao não precisar buscar dados em múltiplas coleções

## Comportamento

### Criação de Novo Exame Pré-Op

1. Usuário faz upload de um arquivo para um paciente que ainda não tem exame pré-op
2. Sistema verifica se já existe registro de exame para o paciente
3. Se não existir:
   - Busca os dados do paciente no banco
   - Valida se o paciente existe
   - Cria novo registro com `paciente_id` e `nome_paciente`
4. Salva o arquivo no campo correspondente

### Atualização de Exame Existente

1. Se o paciente já tem registro de exame pré-op
2. Sistema apenas atualiza o campo específico do arquivo
3. `nome_paciente` permanece inalterado (mantém histórico)

## Testes Recomendados

1. ✅ Criar novo exame pré-op para paciente sem registro anterior
2. ✅ Verificar se `nome_paciente` foi salvo corretamente no MongoDB
3. ✅ Fazer upload de arquivo adicional e verificar que nome não muda
4. ✅ Consultar exames pré-op diretamente pelo nome do paciente
5. ✅ Verificar interface exibe o nome corretamente

## Arquivos Modificados

1. `/backend/src/exames_preop/exames-preop.service.ts`
   - Adicionado import do Paciente
   - Adicionado PacienteModel no constructor
   - Modificado método uploadFile para buscar e incluir nome do paciente

2. `/backend/src/exames_preop/exames-preop.module.ts`
   - Adicionado import do Paciente e PacienteSchema
   - Registrado PacienteSchema no MongooseModule.forFeature

## Notas Importantes

⚠️ **Registros Existentes**: Registros de exames pré-op criados antes desta alteração não terão o campo `nome_paciente`. Considere criar um script de migração se necessário.

⚠️ **Nome Histórico**: O nome é capturado no momento da criação do registro. Se o nome do paciente for alterado posteriormente, o registro de exame pré-op manterá o nome original (comportamento desejado para auditoria).

✅ **Novos Registros**: Todos os novos registros de exames pré-op criados após esta alteração incluirão automaticamente o `nome_paciente`.
