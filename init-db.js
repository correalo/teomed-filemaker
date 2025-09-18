// Script para inicializar o banco de dados TEOMED com dados de exemplo

// Criar usuário admin
db = db.getSiblingDB('admin');
db.createUser({
  user: 'admin',
  pwd: 'teomed2024',
  roles: [{ role: 'root', db: 'admin' }]
});

// Mudar para o banco de dados pacientes_db
db = db.getSiblingDB('pacientes_db');

// Limpar coleções existentes
db.users.drop();
db.pacientes.drop();
db.evolucoes.drop();
db.avaliacoes.drop();
db.receitas.drop();

// Criar usuário para autenticação
db.users.insertOne({
  username: 'admin',
  password: '$2b$10$3wXPnL/Y4LyQJ.ULrL5mHeELwsyHEIAFblcbIkbIys1PUG48yQKLi', // hash para 'teomed2024'
  roles: ['admin'],
  createdAt: new Date(),
  updatedAt: new Date()
});

// Criar pacientes de exemplo
const pacientes = [
  {
    _id: ObjectId(),
    nome: 'MARIA SILVA',
    data_nascimento: '1980-05-15',
    sexo: 'F',
    prontuario: '12345',
    endereco: {
      logradouro: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01001-000'
    },
    contato: {
      telefone: '(11) 3333-4444',
      celular: '(11) 99999-8888',
      email: 'maria.silva@exemplo.com'
    },
    documentos: {
      rg: '12.345.678-9',
      cpf: '123.456.789-00'
    },
    dados_clinicos: {
      peso: 70.5,
      altura: 1.65,
      imc: 25.9
    },
    cirurgia: {
      data_cirurgia: '2023-01-15',
      local_cirurgia: 'Hospital São Paulo',
      tratamento: 'OBESIDADE',
      tipo_cirurgia: 'BYPASS',
      segunda_cirurgia: 'NÃO',
      data_segunda_cirurgia: null,
      petersen_fechado: 'SIM',
      tamanho_alcas: '100/150'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    nome: 'JOÃO SANTOS',
    data_nascimento: '1975-08-22',
    sexo: 'M',
    prontuario: '54321',
    endereco: {
      logradouro: 'Avenida Paulista',
      numero: '1500',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-200'
    },
    contato: {
      telefone: '(11) 2222-3333',
      celular: '(11) 98888-7777',
      email: 'joao.santos@exemplo.com'
    },
    documentos: {
      rg: '98.765.432-1',
      cpf: '987.654.321-00'
    },
    dados_clinicos: {
      peso: 85.2,
      altura: 1.78,
      imc: 26.9
    },
    cirurgia: {
      data_cirurgia: '2023-03-10',
      local_cirurgia: 'Hospital Albert Einstein',
      tratamento: 'DIABETES',
      tipo_cirurgia: 'SLEEVE',
      segunda_cirurgia: 'NÃO',
      data_segunda_cirurgia: null,
      petersen_fechado: 'NÃO',
      tamanho_alcas: '75/150'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Inserir pacientes
db.pacientes.insertMany(pacientes);

// Criar evoluções para os pacientes
const evolucoes = [
  {
    paciente_id: pacientes[0]._id.toString(),
    nome_paciente: pacientes[0].nome,
    data_retorno: '2023-02-15',
    delta_t: '1 mês',
    peso: 68.5,
    delta_peso: -2.0,
    exames_alterados: 'Glicemia: 95 mg/dL',
    medicacoes: ['Omeprazol 40mg', 'Vitamina B12'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    paciente_id: pacientes[0]._id.toString(),
    nome_paciente: pacientes[0].nome,
    data_retorno: '2023-03-15',
    delta_t: '2 meses',
    peso: 65.8,
    delta_peso: -4.7,
    exames_alterados: 'Glicemia: 90 mg/dL, Hemoglobina: 13.5 g/dL',
    medicacoes: ['Omeprazol 40mg', 'Vitamina B12', 'Vitamina D'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    paciente_id: pacientes[1]._id.toString(),
    nome_paciente: pacientes[1].nome,
    data_retorno: '2023-04-10',
    delta_t: '1 mês',
    peso: 82.1,
    delta_peso: -3.1,
    exames_alterados: 'Glicemia: 110 mg/dL',
    medicacoes: ['Metformina 500mg', 'Vitamina B12'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Inserir evoluções
db.evolucoes.insertMany(evolucoes);

// Criar receitas para os pacientes
const receitas = [
  {
    paciente_id: pacientes[0]._id.toString(),
    nome_paciente: pacientes[0].nome,
    data: '2023-02-15',
    medicamentos: [
      {
        nome: 'Omeprazol',
        dosagem: '40mg',
        posologia: '1 comprimido ao dia, em jejum'
      },
      {
        nome: 'Vitamina B12',
        dosagem: '5000mcg',
        posologia: '1 comprimido por semana'
      }
    ],
    observacoes: 'Retorno em 30 dias',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    paciente_id: pacientes[1]._id.toString(),
    nome_paciente: pacientes[1].nome,
    data: '2023-04-10',
    medicamentos: [
      {
        nome: 'Metformina',
        dosagem: '500mg',
        posologia: '1 comprimido após o almoço e jantar'
      },
      {
        nome: 'Vitamina B12',
        dosagem: '5000mcg',
        posologia: '1 comprimido por semana'
      }
    ],
    observacoes: 'Retorno em 30 dias com exames',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Inserir receitas
db.receitas.insertMany(receitas);

// Criar avaliações vazias para os pacientes
const avaliacoes = [
  {
    paciente_id: pacientes[0]._id.toString(),
    nome_paciente: pacientes[0].nome,
    data_criacao: new Date(),
    data_atualizacao: new Date(),
    cardiologista: [],
    endocrino: [],
    nutricionista: [],
    psicologa: [],
    outros: []
  },
  {
    paciente_id: pacientes[1]._id.toString(),
    nome_paciente: pacientes[1].nome,
    data_criacao: new Date(),
    data_atualizacao: new Date(),
    cardiologista: [],
    endocrino: [],
    nutricionista: [],
    psicologa: [],
    outros: []
  }
];

// Inserir avaliações
db.avaliacoes.insertMany(avaliacoes);

print("Banco de dados inicializado com sucesso!");
print("Usuários criados: " + db.users.countDocuments());
print("Pacientes criados: " + db.pacientes.countDocuments());
print("Evoluções criadas: " + db.evolucoes.countDocuments());
print("Receitas criadas: " + db.receitas.countDocuments());
print("Avaliações criadas: " + db.avaliacoes.countDocuments());
