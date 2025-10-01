/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14 já tem o App Router habilitado por padrão
  // Não é mais necessário configurar appDir como experimental
  webpack: (config) => {
    // Ignorar canvas para react-pdf funcionar no cliente
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    return config
  },
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
