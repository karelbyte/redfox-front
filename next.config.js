const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuraciones para evitar caché
  generateEtags: false,
  poweredByHeader: false,
  compress: true,
  
  // Headers para evitar caché
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'http', // Use 'http' since your URL is http://localhost
        hostname: 'localhost',
        port: '5500', // Specify the port your image server is running on
        pathname: '/uploads/categories/**', // Use a wildcard if images are in subdirectories
      },
      {
        protocol: 'http', // Use 'http' since your URL is http://localhost
        hostname: 'localhost',
        port: '5500', // Specify the port your image server is running on
        pathname: '/uploads/brands/**', // Use a wildcard if images are in subdirectories
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);