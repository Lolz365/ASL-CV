/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export for GitHub Pages hosting
  output: 'export',
  trailingSlash: true,
  // Required for MediaPipe WASM files to be served correctly
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
