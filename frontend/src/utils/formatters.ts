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
    return `${parts[0] || '0'}.${parts[1]}`
  }
  
  // Trata caso especial onde o valor começa com ponto (ex: .1)
  if (parts.length === 2 && parts[0] === '') {
    parts[0] = '0'
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

// Função para aplicar a máscara de espaços no peso (__._)
export const applyWeightMask = (value: string | number | null | undefined): string => {
  // Converte para string e trata valores nulos/undefined
  const stringValue = value?.toString() || ''
  if (!stringValue) return '   . '
  
  // Remove todos os caracteres não numéricos
  const cleanValue = stringValue.replace(/[^0-9.]/g, '')
  
  // Extrai apenas os dígitos (sem pontos)
  const digits = cleanValue.replace(/\./g, '')
  
  // Determina a parte inteira e decimal
  let intPart = ''
  let decPart = '0'
  
  if (digits.length > 0) {
    // Se tiver pelo menos um dígito, o último vai para a parte decimal
    decPart = digits.slice(-1)
    
    // Os demais dígitos (se houver) vão para a parte inteira
    if (digits.length > 1) {
      intPart = digits.slice(0, -1)
    }
  }
  
  // Limita a parte inteira a 3 dígitos
  if (intPart.length > 3) {
    intPart = intPart.slice(-3)
  }
  
  // Preenche a parte inteira com espaços à esquerda
  while (intPart.length < 3) {
    intPart = ' ' + intPart
  }
  
  // Retorna o valor formatado com a máscara
  return `${intPart}.${decPart}`
}

// Função para aplicar a máscara no campo de altura (_.__)  
export const applyHeightMask = (value: string | number | null | undefined): string => {
  // Converte para string e trata valores nulos/undefined
  const stringValue = value?.toString() || ''
  if (!stringValue) return ' .  '
  
  // Remove todos os caracteres não numéricos
  const cleanValue = stringValue.replace(/[^0-9.]/g, '')
  
  // Extrai apenas os dígitos (sem pontos)
  const digits = cleanValue.replace(/\./g, '')
  
  // Determina a parte inteira e decimal
  let intPart = ''
  let decPart = '00'
  
  if (digits.length > 0) {
    // Se tiver pelo menos um dígito
    if (digits.length === 1) {
      // Se tiver apenas um dígito, vai para a primeira casa decimal
      decPart = digits + '0'
    } else if (digits.length === 2) {
      // Se tiver dois dígitos, ambos vão para a parte decimal
      decPart = digits
    } else {
      // Se tiver mais de dois dígitos
      // Os dois últimos vão para a parte decimal
      decPart = digits.slice(-2)
      // Os demais vão para a parte inteira
      intPart = digits.slice(0, -2)
    }
  }
  
  // Limita a parte inteira a 1 dígito (altura normalmente é entre 0 e 3 metros)
  if (intPart.length > 1) {
    intPart = intPart.slice(-1)
  }
  
  // Se o dígito inteiro for 0, substitui por espaço
  if (intPart === '0') {
    intPart = ' '
  }
  
  // Preenche a parte inteira com espaço à esquerda se necessário
  if (intPart.length === 0) {
    intPart = ' '
  }
  
  // Retorna o valor formatado com a máscara
  return `${intPart}.${decPart}`
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
  return value
}

export const displayAltura = (value: string): string => {
  if (!value) return ''
  
  // Converte para número e depois de volta para string para normalizar
  const num = parseFloat(value)
  if (isNaN(num)) return value
  
  // Formata o valor com até 2 casas decimais
  const formatted = num.toFixed(2)
  
  // Verifica se o valor começa com "0."
  if (formatted.startsWith('0.')) {
    // Substitui o "0" por um espaço
    return ' ' + formatted.substring(1)
  }
  
  return formatted
}

export const calculateIMC = (peso: string, altura: string): string => {
  // Garante que o peso e altura estejam no formato correto
  const pesoFormatado = formatPeso(peso)
  
  const pesoNum = parseFloat(pesoFormatado)
  let alturaNum = parseFloat(altura)
  
  // Normaliza a altura se estiver no formato incorreto (ex: 81.78 -> 1.78)
  if (alturaNum > 10) {
    alturaNum = alturaNum / 100
  }
  
  if (isNaN(pesoNum) || isNaN(alturaNum) || alturaNum === 0) {
    return ''
  }
  
  const imc = pesoNum / (alturaNum * alturaNum)
  return imc.toFixed(2)
}

export const formatDate = (date: string | Date | undefined | null): string => {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj?.getTime())) {
      return ''
    }
    
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return ''
  }
}
