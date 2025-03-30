// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'oaidalleapiprodscus.blob.core.windows.net', // For DALL·E (if used later)
      'firebasestorage.googleapis.com', // For Firebase Storage
      'storage.googleapis.com' // For Firebase/Google Cloud Storage
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Increase the API body size limit for image generation
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '12mb',
  },
  // Enable HTTP streaming for API routes
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
