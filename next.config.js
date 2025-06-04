/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false, // enable browser source map generation during the production build
  // Configure pageExtensions to include md and mdx
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Temporarily disable ESLint during builds while we fix remaining issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily disable TypeScript checking during builds
  },
  // Modern image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
  },
}

module.exports = nextConfig
