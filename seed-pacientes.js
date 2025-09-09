// Script para popular o banco de dados com pacientes de exemplo
db = db.getSiblingDB('pacientes_db');

// Limpar coleções existentes
db.pacientes.drop();
db.evolucoes.drop();

// Criar pacientes de exemplo
const pacientes = [
  {
    nome: "MARINA DAVID DE CARVALHO",
    dataNascimento: "1985-05-15",
    idade: 40,
    sexo: "FEMININO",
    profissao: "ADVOGADA",
    status: "OPERADO",
    dataPrimeiraConsulta: "2024-01-10",
    prontuario: 1001,
    indicacao: "DR. CARLOS SILVA",
    endereco: {
      completo: "Rua das Flores, 123 - São Paulo/SP",
      cep: "01234-567",
      normalizado: {
        logradouro: "Rua das Flores",
        numero: "123",
        complemento: "Apto 45",
        bairro: "Jardim Paulista",
        cidade: "São Paulo",
        estado: "SP"
      }
    },
    contato: {
      telefone: "(11) 3456-7890",
      email: "marina.carvalho@email.com",
      celular: "(11) 98765-4321"
    },
    convenio: {
      nome: "UNIMED",
      carteirinha: "123456789",
      plano: "PREMIUM"
    },
    documentos: {
      rg: "12.345.678-9",
      cpf: "123.456.789-00"
    },
    cirurgia: {
      previa: true,
      data: "2024-03-15",
      local: "Hospital São Luiz",
      tratamento: "OBESIDADE",
      tipo: "BYPASS",
      petersenFechado: true,
      tamanho_alcas: "100/150",
      data_segunda_cirurgia: "",
      segunda_cirurgia: ""
    },
    dados_clinicos: {
      peso: 95.5,
      altura: 1.65,
      imc: 35.1,
      alergias: "Penicilina",
      has: true,
      diabetes: true,
      dislipidemia: true,
      apneia: false,
      artropatias: false,
      ccc: false,
      esteatose: true,
      hernia_hiato: false,
      refluxo: true,
      hernia_incisional: false,
      tireoide: "NORMAL",
      outras_doencas: "",
      cirurgia_previa: "Apendicectomia",
      cir_previa: "Apendicectomia em 2010",
      personalidade: "TRANQUILA",
      medicacoes_preop: ["Metformina", "Losartana"]
    },
    criadoEm: new Date(),
    atualizadoEm: new Date()
  },
  {
    nome: "JOSÉ ANTONIO FERREIRA",
    dataNascimento: "1970-08-22",
    idade: 55,
    sexo: "MASCULINO",
    profissao: "ENGENHEIRO",
    status: "PRÉ-OPERATÓRIO",
    dataPrimeiraConsulta: "2024-02-05",
    prontuario: 1002,
    indicacao: "DRA. MARIA SANTOS",
    endereco: {
      completo: "Av. Paulista, 1000 - São Paulo/SP",
      cep: "01310-100",
      normalizado: {
        logradouro: "Avenida Paulista",
        numero: "1000",
        complemento: "Sala 1010",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        estado: "SP"
      }
    },
    contato: {
      telefone: "(11) 3333-4444",
      email: "jose.ferreira@email.com",
      celular: "(11) 99999-8888"
    },
    convenio: {
      nome: "BRADESCO SAÚDE",
      carteirinha: "987654321",
      plano: "EXECUTIVO"
    },
    documentos: {
      rg: "98.765.432-1",
      cpf: "987.654.321-00"
    },
    cirurgia: {
      previa: false,
      data: "",
      local: "",
      tratamento: "OBESIDADE",
      tipo: "SLEEVE",
      petersenFechado: false,
      tamanho_alcas: "",
      data_segunda_cirurgia: "",
      segunda_cirurgia: ""
    },
    dados_clinicos: {
      peso: 120.8,
      altura: 1.78,
      imc: 38.1,
      alergias: "Nenhuma",
      has: true,
      diabetes: false,
      dislipidemia: true,
      apneia: true,
      artropatias: true,
      ccc: false,
      esteatose: true,
      hernia_hiato: false,
      refluxo: false,
      hernia_incisional: false,
      tireoide: "NORMAL",
      outras_doencas: "Gota",
      cirurgia_previa: "",
      cir_previa: "",
      personalidade: "ANSIOSA",
      medicacoes_preop: ["Losartana", "Sinvastatina"]
    },
    criadoEm: new Date(),
    atualizadoEm: new Date()
  },
  {
    nome: "JACQUELINE CRISTIANO",
    dataNascimento: "1990-03-10",
    idade: 35,
    sexo: "FEMININO",
    profissao: "MÉDICA",
    status: "OPERADO",
    dataPrimeiraConsulta: "2023-11-15",
    prontuario: 1003,
    indicacao: "DR. ROBERTO ALMEIDA",
    endereco: {
      completo: "Rua Augusta, 500 - São Paulo/SP",
      cep: "01305-000",
      normalizado: {
        logradouro: "Rua Augusta",
        numero: "500",
        complemento: "Apto 82",
        bairro: "Consolação",
        cidade: "São Paulo",
        estado: "SP"
      }
    },
    contato: {
      telefone: "(11) 2222-3333",
      email: "jacqueline.cristiano@email.com",
      celular: "(11) 98888-7777"
    },
    convenio: {
      nome: "AMIL",
      carteirinha: "555666777",
      plano: "MASTER"
    },
    documentos: {
      rg: "34.567.890-1",
      cpf: "345.678.901-23"
    },
    cirurgia: {
      previa: true,
      data: "2023-12-10",
      local: "Hospital Albert Einstein",
      tratamento: "OBESIDADE",
      tipo: "BYPASS",
      petersenFechado: true,
      tamanho_alcas: "75/150",
      data_segunda_cirurgia: "",
      segunda_cirurgia: ""
    },
    dados_clinicos: {
      peso: 88.2,
      altura: 1.62,
      imc: 33.6,
      alergias: "Sulfas",
      has: false,
      diabetes: false,
      dislipidemia: true,
      apneia: false,
      artropatias: false,
      ccc: false,
      esteatose: true,
      hernia_hiato: true,
      refluxo: true,
      hernia_incisional: false,
      tireoide: "HIPOTIREOIDISMO",
      outras_doencas: "",
      cirurgia_previa: "Colecistectomia",
      cir_previa: "Colecistectomia em 2018",
      personalidade: "TRANQUILA",
      medicacoes_preop: ["Levotiroxina", "Omeprazol"]
    },
    criadoEm: new Date(),
    atualizadoEm: new Date()
  }
];

// Inserir pacientes
db.pacientes.insertMany(pacientes);

// Criar evoluções para os pacientes
const evolucoes = [
  {
    paciente_id: db.pacientes.findOne({nome: "MARINA DAVID DE CARVALHO"})._id,
    nome_paciente: "MARINA DAVID DE CARVALHO",
    data_retorno: "2024-04-15T00:00:00.000Z",
    delta_t: "1 mês",
    peso: "90.2",
    delta_peso: "-5.3",
    exames_alterados: "Hemoglobina glicada 5.8%",
    medicacoes: ["Metformina 500mg", "Losartana 50mg", "Omeprazol 20mg"]
  },
  {
    paciente_id: db.pacientes.findOne({nome: "MARINA DAVID DE CARVALHO"})._id,
    nome_paciente: "MARINA DAVID DE CARVALHO",
    data_retorno: "2024-05-15T00:00:00.000Z",
    delta_t: "2 meses",
    peso: "85.5",
    delta_peso: "-10.0",
    exames_alterados: "Hemoglobina glicada 5.5%, Colesterol LDL 110mg/dL",
    medicacoes: ["Metformina 500mg", "Losartana 50mg", "Omeprazol 20mg", "Complexo B"]
  },
  {
    paciente_id: db.pacientes.findOne({nome: "JACQUELINE CRISTIANO"})._id,
    nome_paciente: "JACQUELINE CRISTIANO",
    data_retorno: "2024-01-10T00:00:00.000Z",
    delta_t: "1 mês",
    peso: "83.5",
    delta_peso: "-4.7",
    exames_alterados: "Ferritina baixa",
    medicacoes: ["Levotiroxina 50mcg", "Omeprazol 40mg", "Sulfato ferroso"]
  },
  {
    paciente_id: db.pacientes.findOne({nome: "JACQUELINE CRISTIANO"})._id,
    nome_paciente: "JACQUELINE CRISTIANO",
    data_retorno: "2024-02-10T00:00:00.000Z",
    delta_t: "2 meses",
    peso: "79.8",
    delta_peso: "-8.4",
    exames_alterados: "Ferritina normalizada",
    medicacoes: ["Levotiroxina 50mcg", "Omeprazol 40mg", "Complexo B", "Polivitamínico"]
  },
  {
    paciente_id: db.pacientes.findOne({nome: "JACQUELINE CRISTIANO"})._id,
    nome_paciente: "JACQUELINE CRISTIANO",
    data_retorno: "2024-03-10T00:00:00.000Z",
    delta_t: "3 meses",
    peso: "76.2",
    delta_peso: "-12.0",
    exames_alterados: "Sem alterações",
    medicacoes: ["Levotiroxina 50mcg", "Omeprazol 20mg", "Polivitamínico"]
  }
];

// Inserir evoluções
db.evolucoes.insertMany(evolucoes);

print("Banco de dados populado com sucesso!");
print(`Pacientes inseridos: ${db.pacientes.countDocuments({})}`);
print(`Evoluções inseridas: ${db.evolucoes.countDocuments({})}`);
