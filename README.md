# TEOMED - Sistema de Prontuários Médicos

Sistema moderno de prontuários médicos baseado no FileMaker, desenvolvido com NestJS, Next.js, TypeScript, JWT e MongoDB.

## 🚀 Tecnologias

- **Backend**: NestJS, TypeScript, MongoDB, Mongoose, JWT
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, React Query
- **Banco de Dados**: MongoDB (pacientes_db)
- **Autenticação**: JWT

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- MongoDB (rodando localmente na porta 27017)
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd teomed-filemaker
```

2. Instale as dependências do projeto principal:
```bash
npm install
```

3. Instale as dependências do backend:
```bash
cd backend
npm install
cd ..
```

4. Instale as dependências do frontend:
```bash
cd frontend
npm install
cd ..
```

## 🗄️ Banco de Dados

O sistema utiliza o banco de dados MongoDB `pacientes_db` com as seguintes coleções:

- `pacientes`: Dados principais dos pacientes
- `avaliacoes`: Avaliações médicas (cardiologia, endocrinologia, nutrição, psicologia)
- `evolucoes`: Evoluções pós-operatórias
- `exames_preop`: Exames pré-operatórios
- `receitas`: Receitas médicas
- `relatorio_preop`: Relatórios pré-operatórios

## 🚀 Executando o Sistema

### Desenvolvimento

Para executar tanto o backend quanto o frontend simultaneamente:

```bash
npm run dev
```

Ou executar separadamente:

```bash
# Backend (porta 3001)
npm run dev:backend

# Frontend (porta 3000)
npm run dev:frontend
```

### Produção

```bash
npm run build
npm start
```

## 🔐 Autenticação

**Credenciais padrão:**
- Usuário: `admin`
- Senha: `teomed2024`

## 🎨 Interface

A interface foi desenvolvida para replicar o design e usabilidade do FileMaker original:

- **Cores**: Baseadas na paleta do FileMaker (azul, cinza, verde)
- **Layout**: Cards de pacientes com navegação por setas
- **Portal**: Sistema de abas para diferentes coleções (Evoluções, Avaliações, Exames, Receitas)
- **Navegação**: Setas para navegar entre registros de pacientes

## 📱 Funcionalidades

### Pacientes
- Visualização de dados completos do paciente
- Navegação entre registros com setas
- Busca por nome, CPF, RG ou prontuário
- Dados clínicos e antecedentes familiares

### Portal de Dados
- **Evoluções**: Acompanhamento pós-operatório
- **Avaliações**: Pareceres médicos especializados
- **Exames Pré-op**: Exames pré-operatórios
- **Receitas**: Prescrições médicas

## 🔧 Configuração

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/pacientes_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
PORT=3001
```

### Frontend
O frontend está configurado para se comunicar com o backend na porta 3001.

## 📁 Estrutura do Projeto

```
teomed-filemaker/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Autenticação JWT
│   │   ├── pacientes/      # Módulo de pacientes
│   │   ├── avaliacoes/     # Módulo de avaliações
│   │   ├── evolucoes/      # Módulo de evoluções
│   │   ├── exames-preop/   # Módulo de exames
│   │   ├── receitas/       # Módulo de receitas
│   │   └── schemas/        # Schemas MongoDB
│   └── ...
├── frontend/               # Interface Next.js
│   ├── src/
│   │   ├── app/           # App Router
│   │   ├── components/    # Componentes React
│   │   ├── hooks/         # Custom hooks
│   │   └── types/         # Tipos TypeScript
│   └── ...
└── package.json           # Scripts principais
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas, entre em contato através do email: suporte@teomed.com.br
