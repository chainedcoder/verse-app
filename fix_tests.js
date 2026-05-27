const fs = require('fs')

function fixTest(file) {
  let content = fs.readFileSync(file, 'utf8')
  
  // Fix mockClear -> mockReset
  content = content.replace(/\.mockClear\(\)/g, '.mockReset()')
  
  // Fix Website (Optional) -> Website
  content = content.replace(/Website \(Optional\)/g, 'Website')
  
  // Fix Next router mock in Preferences and Sessions if needed
  if (!content.includes('AppRouterContext')) {
    content = content.replace(/jest\.mock\('next\/navigation'.+?\}\)\)/s, `
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    replace: jest.fn()
  })),
  usePathname: jest.fn(),
  useSearchParams: jest.fn()
}))
`)
  }
  
  fs.writeFileSync(file, content)
}

['__tests__/ProfileEditor.test.jsx', '__tests__/PreferencesClient.test.jsx', '__tests__/SessionsClient.test.jsx'].forEach(fixTest)
