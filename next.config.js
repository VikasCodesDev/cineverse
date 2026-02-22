/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
    ],
  },
  // Ensure API routes and pages that need request context are dynamic at build
  experimental: {
    serverComponentsExternalPackages: ['mongodb'],
  },
}

module.exports = nextConfig
