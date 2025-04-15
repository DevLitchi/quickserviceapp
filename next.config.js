/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["vercel-blob.com"],
    unoptimized: true,
  },
  // Removed the webpack configuration that was causing the error
}

module.exports = nextConfig
