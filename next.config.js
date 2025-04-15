/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["vercel-blob.com"],
    unoptimized: true,
  },
  // Configuración para manejar módulos binarios de Node.js
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // No intentar cargar módulos binarios en el cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        util: require.resolve("util/"),
      }
    }
    return config
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
