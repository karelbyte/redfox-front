/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5500',
        pathname: '/api/**',
      },
    ],
  },
};

module.exports = nextConfig; 