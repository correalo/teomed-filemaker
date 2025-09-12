/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14 já tem o App Router habilitado por padrão
  // Não é mais necessário configurar appDir como experimental
}

// Configuração para o servidor de desenvolvimento
const serverConfig = {
  env: {
    PORT: 3000,
  },
  serverRuntimeConfig: {
    port: 3000,
  },
}

module.exports = {
  ...nextConfig,
  ...serverConfig,
}
