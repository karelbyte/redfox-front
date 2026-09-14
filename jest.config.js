const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // MSW usa BroadcastChannel, que mantiene una referencia viva en el bucle de
  // eventos de Node y dejaría el proceso colgado tras terminar las pruebas.
  forceExit: true,
  testEnvironment: '<rootDir>/jest.environment.js',
  // MSW v2 publica 'msw/node' mediante el campo "exports" del paquete, que el
  // resolvedor de Jest no alcanza con las condiciones por defecto de jsdom.
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/app/layout.tsx',
    '!src/app/page.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/e2e/',
  ],
};

// MSW v2 y sus dependencias se publican solo como ESM. next/jest antepone sus
// propios transformIgnorePatterns, y Jest ignora un módulo si coincide con
// cualquiera de ellos, así que hay que reemplazarlos una vez resuelta la
// configuración en lugar de añadir otro patrón.
const ESM_DEPENDENCIES = [
  'msw',
  '@mswjs',
  '@open-draft',
  '@bundled-es-modules',
  '@inquirer',
  'until-async',
  'rettime',
  'strict-event-emitter',
  'headers-polyfill',
  'outvariant',
  'is-node-process',
  'tough-cookie',
  'path-to-regexp',
  'statuses',
  'cookie',
  'graphql',
  'type-fest',
  'picocolors',
];

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = async () => {
  const config = await createJestConfig(customJestConfig)();

  config.transformIgnorePatterns = [
    `/node_modules/(?!(${ESM_DEPENDENCIES.join('|')})/)`,
    '^.+\\.module\\.(css|sass|scss)$',
  ];

  return config;
};