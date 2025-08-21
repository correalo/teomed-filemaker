import { z } from 'zod'

// Schema para endereço
export const enderecoSchema = z.object({
  completo: z.string().optional(),
  cep: z.string()
    .regex(/^\d{5}-?\d{3}$/, 'CEP deve ter formato 00000-000')
    .optional(),
  normalizado: z.object({
    logradouro: z.string().min(1, 'Logradouro é obrigatório'),
    numero: z.string().min(1, 'Número é obrigatório'),
    complemento: z.string().optional(),
    bairro: z.string().min(1, 'Bairro é obrigatório'),
    cidade: z.string().min(1, 'Cidade é obrigatória'),
    estado: z.string()
      .length(2, 'Estado deve ter 2 caracteres')
      .regex(/^[A-Z]{2}$/, 'Estado deve ser em maiúsculas (ex: SP)')
  })
})

// Schema para contato
export const contatoSchema = z.object({
  telefone: z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve ter formato (00) 0000-0000')
    .optional(),
  celular: z.string()
    .regex(/^\(\d{2}\)\s\d{5}-\d{4}$/, 'Celular deve ter formato (00) 00000-0000')
    .optional(),
  email: z.string()
    .email('Email inválido')
    .optional()
})

// Schema para convênio
export const convenioSchema = z.object({
  nome: z.string().optional(),
  carteirinha: z.string().optional(),
  plano: z.string().optional()
})

// Schema para documentos
export const documentosSchema = z.object({
  rg: z.string().optional(),
  cpf: z.string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve ter formato 000.000.000-00')
    .optional()
})

// Schema principal do paciente
export const pacienteSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  dataNascimento: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve ter formato YYYY-MM-DD')
    .optional(),
  idade: z.number()
    .int('Idade deve ser um número inteiro')
    .min(0, 'Idade deve ser positiva')
    .max(150, 'Idade deve ser menor que 150')
    .optional(),
  sexo: z.enum(['M', 'F'], {
    errorMap: () => ({ message: 'Sexo deve ser M ou F' })
  }).optional(),
  indicacao: z.string().optional(),
  endereco: enderecoSchema,
  contato: contatoSchema,
  convenio: convenioSchema,
  documentos: documentosSchema
})

// Schema para criação de paciente (campos obrigatórios)
export const createPacienteSchema = pacienteSchema.extend({
  nome: z.string().min(2, 'Nome é obrigatório')
})

// Schema para atualização de paciente (todos campos opcionais exceto ID)
export const updatePacienteSchema = pacienteSchema.partial().extend({
  _id: z.string().min(1, 'ID é obrigatório')
})

// Tipos inferidos automaticamente
export type PacienteFormData = z.infer<typeof pacienteSchema>
export type CreatePacienteData = z.infer<typeof createPacienteSchema>
export type UpdatePacienteData = z.infer<typeof updatePacienteSchema>
