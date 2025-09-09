import axios from 'axios';

// Cria uma instância do axios com a URL base
const api = axios.create({
  baseURL: 'http://localhost:3004',
});

// Adiciona um interceptor para incluir o token de autenticação em todas as requisições
api.interceptors.request.use((config) => {
  // Verifica se está no navegador antes de acessar localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
