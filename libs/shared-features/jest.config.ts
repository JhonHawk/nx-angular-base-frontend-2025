export default {
  displayName: 'shared-features',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../coverage/shared-features',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  // Angular 20.2 compatibility fixes for locale files and ES modules
  transformIgnorePatterns: [
    'node_modules/(?!(@angular/common/locales/.*|uuid/.*|.*\\.mjs$|.*\\.mts$|.*\\.ts$))'
  ],
  moduleNameMapper: {
    '@angular/common/locales/(.*)$': '<rootDir>/node_modules/@angular/common/locales/$1.mjs'
  },
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
