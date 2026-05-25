import path from 'path'
import fs from 'fs'

// Scenario 3: /weekly-dashboard issues a permanent 308 redirect to the root route.
//
// The app is a static export served via `npx serve frontend/out`.
// The Next.js basePath is '/health-sdlc-playground', so the app's root page
// is served at http://localhost:3000/health-sdlc-playground/.
//
// The serve.json source paths include the basePath prefix because `npx serve`
// matches against the full URL path.
//
// The serve.json destination is "/health-sdlc-playground/" — this is the
// path that causes `npx serve` to emit a Location header pointing to the
// app's root (the Weekly Dashboard). Using destination "/" would redirect
// to the static file server root (an empty directory), not the app.
//
// Gherkin Scenario 3 states: Location header is "/"
// This is interpreted as the root route of the application, which in the
// deployed context is "/health-sdlc-playground/". The Gherkin's "/" refers
// to the application root, not the static file server root.
//
// Scenario 4 (browser follows redirect, lands on root with Weekly Dashboard
// visible) is deferred to E2E — requires a running server and real HTTP
// redirect following.

describe('308 redirect configuration (Scenario 3)', () => {
  const serveJsonPath = path.resolve(__dirname, '../../../public/serve.json')

  it('serve.json exists in frontend/public/', () => {
    expect(fs.existsSync(serveJsonPath)).toBe(true)
  })

  it('serve.json contains a 308 redirect from /health-sdlc-playground/weekly-dashboard', () => {
    const content = JSON.parse(fs.readFileSync(serveJsonPath, 'utf-8'))
    const redirects: Array<{ source: string; destination: string; type: number }> =
      content.redirects ?? []
    const match = redirects.find(
      (r) =>
        r.source === '/health-sdlc-playground/weekly-dashboard' &&
        r.type === 308
    )
    expect(match).toBeDefined()
  })

  it('serve.json contains a 308 redirect from /health-sdlc-playground/weekly-dashboard/', () => {
    const content = JSON.parse(fs.readFileSync(serveJsonPath, 'utf-8'))
    const redirects: Array<{ source: string; destination: string; type: number }> =
      content.redirects ?? []
    const match = redirects.find(
      (r) =>
        r.source === '/health-sdlc-playground/weekly-dashboard/' &&
        r.type === 308
    )
    expect(match).toBeDefined()
  })

  it('redirect destination is "/health-sdlc-playground/" — the app root served by npx serve', () => {
    const content = JSON.parse(fs.readFileSync(serveJsonPath, 'utf-8'))
    const redirects: Array<{ source: string; destination: string; type: number }> =
      content.redirects ?? []
    const weeklyDashboardRedirects = redirects.filter(
      (r) => r.source.includes('/weekly-dashboard') && r.type === 308
    )
    expect(weeklyDashboardRedirects.length).toBeGreaterThan(0)
    for (const r of weeklyDashboardRedirects) {
      expect(r.destination).toBe('/health-sdlc-playground/')
    }
  })
})