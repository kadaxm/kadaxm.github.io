/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export for GitHub Pages (https://kadaxm.github.io)
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
