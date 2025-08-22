export const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      return ''
    }
    
    // Formato brasileiro: DD/MM/YYYY
    return date.toLocaleDateString('pt-BR')
  } catch (error) {
    return ''
  }
}

export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      return ''
    }
    
    // Formato para input date: YYYY-MM-DD
    return date.toISOString().split('T')[0]
  } catch (error) {
    return ''
  }
}

export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null
  
  try {
    const date = new Date(dateString)
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      return null
    }
    
    return date
  } catch (error) {
    return null
  }
}
