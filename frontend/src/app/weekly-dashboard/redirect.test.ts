import path from 'path'
import fs from 'fs'

// Scenario 3: /weekly-dashboard issues a permanent 308 redirect to /
// The app is deployed as a static export under basePath '/health-sdlc-playground'.
// When served via `npx serve frontend/out`, all paths are basePath-prefixed.
// The serve.json redirects must use the full basePath-prefixed paths.

describe('308 redirect configuration (Scenario 3)', () => {
  const serveJsonPath = path.resolve(__dirname, '../../../public/serve.json')

  it('serve.json exists in frontend/public/', () => {
    expect(fs.existsSync(serveJsonPath)).toBe(true)
  })

  it('serve.json contains a 308 redirect from /health-sdlc-playground/weekly-dashboard to /health-sdlc-playground/', () => {
    const content = JSON.parse(fs.readFileSync(serveJsonPath, 'utf-8'))
    const redirects: Array<{ source: string; destination: string; type: number }> =
      content.redirects ?? []
    const match = redirects.find(
      (r) =>
        r.source === '/health-sdlc-playground/weekly-dashboard' &&
        r.destination === '/health-sdlc-playground/' &&
        r.type === 308
    )
    expect(match).toBeDefined()
  })

  it('serve.json contains a 308 redirect from /health-sdlc-playground/weekly-dashboard/ to /health-sdlc-playground/', () => {
    const content = JSON.parse(fs.readFileSync(serveJsonPath, 'utf-8'))
    const redirects: Array<{ source: string; destination: string; type: number }> =
      content.redirects ?? []
    const match = redirects.find(
      (r) =>
        r.source === '/health-sdlc-playground/weekly-dashboard/' &&
        r.destination === '/health-sdlc-playground/' &&
        r.type === 308
    )
    expect(match).toBeDefined()
  })
})