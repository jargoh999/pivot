/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [
      'picsum.photos',
      'images.unsplash.com',
      'plus.unsplash.com',
      'images.pexels.com',
    ],
  },
}

export default nextConfig
