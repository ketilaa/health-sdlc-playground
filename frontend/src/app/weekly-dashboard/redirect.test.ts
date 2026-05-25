import path from 'path'
import fs from 'fs'

// Scenario 3: /weekly-dashboard issues a permanent 308 redirect to /
// The app is deployed as a static export under basePath '/health-sdlc-playground'.
// When served via `npx serve frontend/out`, paths are basePath-prefixed, so
// the serve.json source uses the full path. The destination is "/" per the
// Gherkin specification (Location header: "/").

describe('308 redirect configuration (Scenario 3)', () => {
  const serveJsonPath = path.resolve(__dirname, '../../../public/serve.json')

  it('serve.json exists in frontend/public/', () => {
    expect(fs.existsSync(serveJsonPath)).toBe(true)
  })

  it('serve.json contains a 308 redirect from /health-sdlc-playground/weekly-dashboard to /', () => {
    const content = JSON.parse(fs.readFileSync(serveJsonPath, 'utf-8'))
    const redirects: Array<{ source: string; destination: string; type: number }> =
      content.redirects ?? []
    const match = redirects.find(
      (r) =>
        r.source === '/health-sdlc-playground/weekly-dashboard' &&
        r.destination === '/' &&
        r.type === 308
    )
    expect(match).toBeDefined()
  })

  it('serve.json contains a 308 redirect from /health-sdlc-playground/weekly-dashboard/ to /', () => {
    const content = JSON.parse(fs.readFileSync(serveJsonPath, 'utf-8'))
    const redirects: Array<{ source: string; destination: string; type: number }> =
      content.redirects ?? []
    const match = redirects.find(
      (r) =>
        r.source === '/health-sdlc-playground/weekly-dashboard/' &&
        r.destination === '/' &&
        r.type === 308
    )
    expect(match).toBeDefined()
  })

  it('weekly-dashboard/page.tsx does not call redirect() from next/navigation (build-safe for output:export)', () => {
    const pagePath = path.resolve(__dirname, './page.tsx')
    expect(fs.existsSync(pagePath)).toBe(true)
    const source = fs.readFileSync(pagePath, 'utf-8')
    // Must not import or call redirect() — doing so causes build failure with output:'export'
    expect(source).not.toMatch(/from ['"]next\/navigation['"]/)
    expect(source).not.toMatch(/\bredirect\s*\(/)
  })
})