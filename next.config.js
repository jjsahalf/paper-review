/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      '@prisma/client',
      '@prisma/adapter-libsql',
      '@libsql/client',
      'libsql',
    ],
  },
}

module.exports = nextConfig
