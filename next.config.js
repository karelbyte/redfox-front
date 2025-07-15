const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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