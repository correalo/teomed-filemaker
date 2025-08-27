// Formatadores para campos específicos

export const formatPeso = (value: string): string => {
  // Remove tudo que não é número ou ponto
  const cleaned = value.replace(/[^\d.]/g, '')
  
  // Se não tem valor, retorna vazio
  if (!cleaned) return ''
  
  // Se tem ponto, divide em partes
  const parts = cleaned.split('.')
  
  // Se tem mais de um ponto, mantém apenas o primeiro
  if (parts.length > 2) {
    return `${parts[0]}.${parts[1]}`
  }
  
  // Limita a parte inteira a 3 dígitos (máximo 999.9 kg)
  if (parts[0] && parts[0].length > 3) {
    parts[0] = parts[0].substring(0, 3)
  }
  
  // Se tem parte decimal, limita a 1 dígito
  if (parts.length === 2) {
    const decimal = parts[1].substring(0, 1)
    return `${parts[0]}.${decimal}`
  }
  
  return parts[0] || ''
}

export const formatAltura = (value: string): string => {
  // Remove tudo que não é número ou ponto
  const cleaned = value.replace(/[^\d.]/g, '')
  
  // Se não tem valor, retorna vazio
  if (!cleaned) return ''
  
  // Se tem ponto, divide em partes
  const parts = cleaned.split('.')
  
  // Se tem mais de um ponto, mantém apenas o primeiro
  if (parts.length > 2) {
    return `${parts[0]}.${parts[1]}`
  }
  
  // Limita a parte inteira a 1 dígito (máximo 9.99 m)
  if (parts[0] && parts[0].length > 1) {
    parts[0] = parts[0].substring(0, 1)
  }
  
  // Se tem parte decimal, limita a 2 dígitos
  if (parts.length === 2) {
    const decimal = parts[1].substring(0, 2)
    return `${parts[0]}.${decimal}`
  }
  
  return parts[0] || ''
}

export const validatePeso = (value: string): { isValid: boolean; message?: string } => {
  if (!value) return { isValid: true }
  
  const num = parseFloat(value)
  
  if (isNaN(num)) {
    return { isValid: false, message: 'Peso deve ser um número válido' }
  }
  
  if (num <= 0) {
    return { isValid: false, message: 'Peso deve ser maior que zero' }
  }
  
  if (num > 999.9) {
    return { isValid: false, message: 'Peso não pode ser maior que 999.9 kg' }
  }
  
  return { isValid: true }
}

export const validateAltura = (value: string): { isValid: boolean; message?: string } => {
  if (!value) return { isValid: true }
  
  const num = parseFloat(value)
  
  if (isNaN(num)) {
    return { isValid: false, message: 'Altura deve ser um número válido' }
  }
  
  if (num <= 0) {
    return { isValid: false, message: 'Altura deve ser maior que zero' }
  }
  
  if (num > 9.99) {
    return { isValid: false, message: 'Altura não pode ser maior que 9.99 m' }
  }
  
  if (num < 0.30) {
    return { isValid: false, message: 'Altura deve ser maior que 0.30 m' }
  }
  
  return { isValid: true }
}

export const displayPeso = (value: string): string => {
  if (!value) return ''
  return `${value} kg`
}

export const displayAltura = (value: string): string => {
  if (!value) return ''
  return `${value} m`
}

export const calculateIMC = (peso: string, altura: string): string => {
  if (!peso || !altura) return ''
  
  const pesoNum = parseFloat(peso)
  const alturaNum = parseFloat(altura)
  
  if (isNaN(pesoNum) || isNaN(alturaNum) || pesoNum <= 0 || alturaNum <= 0) {
    return ''
  }
  
  const imc = pesoNum / (alturaNum * alturaNum)
  return imc.toFixed(2)
}
