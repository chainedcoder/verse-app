import nextJest from 'next/jest.js'

// Pin the timezone so date-formatting snapshots match between local machines and CI
process.env.TZ = 'UTC'

const createJestConfig = nextJest({
  dir: './',
})
 
const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  globalSetup: '<rootDir>/e2e/global-setup.js',
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/e2e/', '<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}
 
export default createJestConfig(config)
