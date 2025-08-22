import * as yup from 'yup'

// Schema para endereço
export const enderecoSchema = yup.object({
  completo: yup.string().optional(),
  cep: yup.string()
    .matches(/^\d{5}-?\d{3}$/, 'CEP deve ter formato 00000-000')
    .optional(),
  normalizado: yup.object({
    logradouro: yup.string().required('Logradouro é obrigatório'),
    numero: yup.string().required('Número é obrigatório'),
    complemento: yup.string().optional(),
    bairro: yup.string().required('Bairro é obrigatório'),
    cidade: yup.string().required('Cidade é obrigatória'),
    estado: yup.string()
      .length(2, 'Estado deve ter 2 caracteres')
      .matches(/^[A-Z]{2}$/, 'Estado deve ser em maiúsculas (ex: SP)')
      .required('Estado é obrigatório')
  }).required()
}).required()

// Schema para contato
export const contatoSchema = yup.object({
  telefone: yup.string()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve ter formato (00) 0000-0000')
    .optional(),
  celular: yup.string()
    .matches(/^\(\d{2}\)\s\d{5}-\d{4}$/, 'Celular deve ter formato (00) 00000-0000')
    .optional(),
  email: yup.string()
    .email('Email inválido')
    .optional()
}).required()

// Schema para convênio
export const convenioSchema = yup.object({
  nome: yup.string().optional(),
  carteirinha: yup.string().optional(),
  plano: yup.string().optional()
}).required()

// Schema para documentos
export const documentosSchema = yup.object({
  rg: yup.string().optional(),
  cpf: yup.string()
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve ter formato 000.000.000-00')
    .optional()
}).required()

// Schema principal do paciente
export const pacienteSchema = yup.object({
  nome: yup.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .required('Nome é obrigatório'),
  dataNascimento: yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data deve ter formato YYYY-MM-DD')
    .optional(),
  idade: yup.number()
    .integer('Idade deve ser um número inteiro')
    .min(0, 'Idade deve ser positiva')
    .max(150, 'Idade deve ser menor que 150')
    .optional(),
  sexo: yup.string()
    .oneOf(['M', 'F'], 'Sexo deve ser M ou F')
    .optional(),
  indicacao: yup.string().optional(),
  dataPrimeiraConsulta: yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data deve ter formato YYYY-MM-DD')
    .optional(),
  endereco: enderecoSchema,
  contato: contatoSchema,
  convenio: convenioSchema,
  documentos: documentosSchema
})

// Schema para criação de paciente (campos obrigatórios)
export const createPacienteSchema = pacienteSchema.clone().shape({
  nome: yup.string().min(2, 'Nome é obrigatório').required('Nome é obrigatório')
})

// Schema para atualização de paciente (todos campos opcionais exceto ID)
export const updatePacienteSchema = yup.object({
  _id: yup.string().required('ID é obrigatório'),
  nome: yup.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),
  dataNascimento: yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data deve ter formato YYYY-MM-DD')
    .optional(),
  idade: yup.number()
    .integer('Idade deve ser um número inteiro')
    .min(0, 'Idade deve ser positiva')
    .max(150, 'Idade deve ser menor que 150')
    .optional(),
  sexo: yup.string()
    .oneOf(['M', 'F'], 'Sexo deve ser M ou F')
    .optional(),
  indicacao: yup.string().optional(),
  dataPrimeiraConsulta: yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data deve ter formato YYYY-MM-DD')
    .optional(),
  endereco: enderecoSchema.optional(),
  contato: contatoSchema.optional(),
  convenio: convenioSchema.optional(),
  documentos: documentosSchema.optional()
})

// Tipos inferidos automaticamente
export type PacienteFormData = yup.InferType<typeof pacienteSchema>
export type CreatePacienteData = yup.InferType<typeof createPacienteSchema>
export type UpdatePacienteData = yup.InferType<typeof updatePacienteSchema>
