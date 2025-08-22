// Lista de convênios com ordenação personalizada
const conveniosList = [
  // Prioridade alta - aparecem primeiro
  'Particular',
  'SulAmérica',
  'Bradesco',
  'Amil',
  
  // Outros convênios em ordem alfabética
  'Alice',
  'Allianz',
  'Ameplan',
  'Amil Beta',
  'Cabesp',
  'Caixa',
  'Care Plus',
  'Classes',
  'Correios',
  'Cuidar',
  'Cassi',
  'Medix Economus',
  'Embratel',
  'Fundação Cesp',
  'Gama',
  'Geap',
  'Golden Cross',
  'Ipti',
  'Itaú',
  'Intermédica',
  'Life',
  'Lincx',
  'Marítima',
  'Medial',
  'Mediservice',
  'Metrus',
  'Notre Dame',
  'Omint',
  'One Health',
  'Plantel',
  'Porto Seguro',
  'Prevent Senior',
  'Sabesp',
  'Prev',
  'Sami Seguros',
  'Unimed',
  'Sompo Saúde',
  'Trasmontano',
  'Unimed Central Nacional',
  'Unimed Estilo Nacional',
  'Unimed Fesp',
  'Unimed Guarulhos',
  'Unimed Paulistana',
  'Unimed Santa Catarina',
  'Unimed São Roque',
  'Vera Cruz',
  'Volkswagen',
  'São Cristóvão Saúde',
  'Funcesp',
  'Med Tour',
  'Plena Saúde',
  'Sistema',
  'Unimed Seguros'
].sort((a, b) => {
  // Ordem prioritária
  const priority = ['Particular', 'SulAmérica', 'Bradesco', 'Amil']
  
  const aIndex = priority.indexOf(a)
  const bIndex = priority.indexOf(b)
  
  // Se ambos estão na lista prioritária, manter ordem
  if (aIndex !== -1 && bIndex !== -1) {
    return aIndex - bIndex
  }
  
  // Se apenas 'a' está na lista prioritária
  if (aIndex !== -1) return -1
  
  // Se apenas 'b' está na lista prioritária
  if (bIndex !== -1) return 1
  
  // Se nenhum está na lista prioritária, ordem alfabética
  return a.localeCompare(b, 'pt-BR')
})

export const getConvenioOptions = () => {
  return conveniosList.map((convenio: string) => ({
    value: convenio,
    label: convenio
  }))
}

export { conveniosList }
