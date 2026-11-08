/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'lh3.googleusercontent.com',
      'maps.googleapis.com',
      'images.unsplash.com',
      'unsplash.com',
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
