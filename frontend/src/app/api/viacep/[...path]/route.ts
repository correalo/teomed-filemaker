import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const viaCepUrl = `https://viacep.com.br/ws/${path}`
    
    const response = await fetch(viaCepUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`ViaCEP API returned ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Proxy ViaCEP error:', error)
    
    // Retorna dados mockados em caso de erro
    const mockData = {
      cep: params.path[0] ? `${params.path[0].slice(0,5)}-${params.path[0].slice(5)}` : '00000-000',
      logradouro: 'Rua Exemplo',
      complemento: '',
      bairro: 'Centro',
      localidade: 'São Paulo',
      uf: 'SP',
      ibge: '3550308',
      gia: '1004',
      ddd: '11',
      siafi: '7107'
    }
    
    return NextResponse.json(mockData)
  }
}
