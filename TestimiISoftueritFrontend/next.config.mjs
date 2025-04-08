/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/Account/register', // çdo kërkesë që fillon me /api/
        destination: 'https://localhost:7234/api/Account/register', // ridrejtohet te backend API
      },
    ]
  },
}

export default nextConfig
