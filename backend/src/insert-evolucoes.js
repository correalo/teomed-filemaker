// Script para inserir dados de evoluções diretamente no MongoDB
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log('Conectado ao MongoDB');
    
    const database = client.db();
    const pacientesCollection = database.collection('pacientes');
    const evolucoesCollection = database.collection('evolucoes');
    
    // Buscar todos os pacientes
    const pacientes = await pacientesCollection.find({}).toArray();
    
    if (pacientes.length === 0) {
      console.log('Nenhum paciente encontrado. Não é possível criar evoluções.');
      return;
    }
    
    console.log(`Encontrados ${pacientes.length} pacientes.`);
    
    // Limpar coleção de evoluções existente
    await evolucoesCollection.deleteMany({});
    console.log('Coleção de evoluções limpa.');
    
    // Para cada paciente, criar algumas evoluções
    for (const paciente of pacientes) {
      const pacienteId = paciente._id.toString();
      const nomePaciente = paciente.nome;
      
      console.log(`Criando evoluções para o paciente: ${nomePaciente} (ID: ${pacienteId})`);
      
      // Criar 3 evoluções para cada paciente com datas diferentes
      const dataAtual = new Date();
      
      // Primeira evolução (3 meses atrás)
      const data1 = new Date(dataAtual);
      data1.setMonth(data1.getMonth() - 3);
      
      // Segunda evolução (2 meses atrás)
      const data2 = new Date(dataAtual);
      data2.setMonth(data2.getMonth() - 2);
      
      // Terceira evolução (1 mês atrás)
      const data3 = new Date(dataAtual);
      data3.setMonth(data3.getMonth() - 1);
      
      const evolucoes = [
        {
          paciente_id: pacienteId,
          nome_paciente: nomePaciente,
          data_retorno: data1,
          delta_t: '3 meses',
          peso: Math.floor(70 + Math.random() * 30), // Peso entre 70 e 100 kg
          delta_peso: -Math.floor(Math.random() * 5), // Perda de peso entre 0 e 5 kg
          exames_alterados: 'Hemograma, Glicemia',
          medicacoes: ['Metformina 500mg', 'Omeprazol 20mg']
        },
        {
          paciente_id: pacienteId,
          nome_paciente: nomePaciente,
          data_retorno: data2,
          delta_t: '2 meses',
          peso: Math.floor(65 + Math.random() * 30), // Peso entre 65 e 95 kg
          delta_peso: -Math.floor(Math.random() * 3), // Perda de peso entre 0 e 3 kg
          exames_alterados: 'Glicemia',
          medicacoes: ['Metformina 500mg', 'Omeprazol 20mg', 'Vitamina B12']
        },
        {
          paciente_id: pacienteId,
          nome_paciente: nomePaciente,
          data_retorno: data3,
          delta_t: '1 mês',
          peso: Math.floor(60 + Math.random() * 30), // Peso entre 60 e 90 kg
          delta_peso: -Math.floor(Math.random() * 2), // Perda de peso entre 0 e 2 kg
          exames_alterados: 'Nenhum',
          medicacoes: ['Vitamina B12', 'Suplemento proteico']
        }
      ];
      
      // Salvar as evoluções no banco de dados
      for (const evolucao of evolucoes) {
        await evolucoesCollection.insertOne(evolucao);
        console.log(`Evolução criada para ${nomePaciente} em ${evolucao.data_retorno}`);
      }
    }
    
    console.log('Dados de exemplo de evoluções criados com sucesso!');
  } catch (error) {
    console.error('Erro ao criar dados de exemplo:', error);
  } finally {
    await client.close();
    console.log('Conexão com o MongoDB fechada');
  }
}

run();
