const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  generateEtags: false,
  poweredByHeader: false,
  compress: true,

  async headers() {
    return [
      {
        source: '/public/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
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
    unoptimized: true,
  },

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:tenant/:locale/nitro:ext(.png|.jpg|.jpeg|.gif|.svg)',
          destination: '/nitro:ext',
        },
        {
          source: '/:tenant/:locale/nitrob:ext(.png|.jpg|.jpeg|.gif|.svg)',
          destination: '/nitrob:ext',
        },
        {
          source: '/:tenant/:locale/nitrog:ext(.png|.jpg|.jpeg|.gif|.svg)',
          destination: '/nitrog:ext',
        },
        {
          source: '/:tenant/:locale/nitrogy:ext(.png|.jpg|.jpeg|.gif|.svg)',
          destination: '/nitrogy:ext',
        },
        {
          source: '/:tenant/:locale/nitrobw:ext(.png|.jpg|.jpeg|.gif|.svg)',
          destination: '/nitrobw:ext',
        },
        {
          source: '/:tenant/:locale/nitro-s:ext(.png|.jpg|.jpeg|.gif|.svg)',
          destination: '/nitro-s:ext',
        },
      ],
    };
  },
};

module.exports = withNextIntl(nextConfig);