/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  setupFiles: ['<rootDir>/jest/setup.js'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|expo-modules-core|react-navigation|@react-navigation/.*|react-native-android-widget|expo-linear-gradient)/)',
  ],
  collectCoverageFrom: [
    'src/logic/**/*.ts',
    'src/storage/**/*.ts',
    'src/services/**/*.ts',
    'src/components/**/*.tsx',
  ],
};
