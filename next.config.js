/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep your existing static export setup
  output: 'export',

  // Disable image optimization for compatibility with static export / Netlify
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
