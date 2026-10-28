import fs from 'node:fs'
import path from 'node:path'
import postcss from 'postcss'
import config from '../postcss.config.mjs'

const appDirectory = path.resolve(process.cwd(), 'app')

it('leaves relative CSS imports intact for the bundler, even with a virtual input path', async () => {
  const css = fs.readFileSync(path.join(appDirectory, 'globals.css'), 'utf8')
  const plugins = Object.entries(config.plugins).map(([name, options]) => require(name)(options))
  const result = await postcss(plugins).process(css, {
    // Reproduce the missing source-directory context seen in the failing build.
    from: path.resolve(process.cwd(), 'virtual.css'),
  })
  const imports = []
  result.root.walkAtRules('import', rule => imports.push(rule.params.replace(/["']/g, '')))
  expect(imports.length).toBeGreaterThan(0)
  for (const imported of imports) {
    expect(fs.existsSync(path.resolve(appDirectory, imported))).toBe(true)
  }
  expect(result.css).toBe(css)
  expect(result.warnings()).toHaveLength(0)
})

it('parses the imported stylesheets without requiring Tailwind transformations', () => {
  const css = postcss.parse(fs.readFileSync(path.join(appDirectory, 'globals.css'), 'utf8'))
  css.walkAtRules('import', rule => {
    const filename = path.resolve(appDirectory, rule.params.replace(/["']/g, ''))
    const stylesheet = postcss.parse(fs.readFileSync(filename, 'utf8'), { from: filename })
    expect(stylesheet.nodes.length).toBeGreaterThan(0)
    const tailwindDirectives = []
    stylesheet.walkAtRules(/^(tailwind|apply|theme|utility|variant|reference)$/, item => tailwindDirectives.push(item.name))
    expect(tailwindDirectives).toEqual([])
  })
})

it('uses the alternative development bundler instead of the worker path that froze the Mac', () => {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'))
  expect(pkg.scripts.dev).toBe('next dev --webpack')
})
