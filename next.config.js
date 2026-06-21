/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk', 'technicalindicators'],
  },
}

module.exports = nextConfig
