import '@testing-library/jest-dom'
import path from 'path'
import fs from 'fs'

// Scenario 3: /weekly-dashboard issues a permanent 308 redirect to /
// For static-export deployments, this is enforced via serve.json.
// The test verifies the configuration file exists and contains the correct
// redirect rule (source, destination, type 308).

describe('308 redirect configuration (Scenario 3)', () => {
  const serveJsonPath = path.resolve(__dirname, '../../../public/serve.json')

  it('serve.json exists in frontend/public/', () => {
    expect(fs.existsSync(serveJsonPath)).toBe(true)
  })

  it('serve.json contains a 308 redirect from /weekly-dashboard to /', () => {
    const content = JSON.parse(fs.readFileSync(serveJsonPath, 'utf-8'))
    const redirects: Array<{ source: string; destination: string; type: number }> =
      content.redirects ?? []
    const match = redirects.find(
      (r) => r.source === '/weekly-dashboard' && r.destination === '/' && r.type === 308
    )
    expect(match).toBeDefined()
  })

  it('serve.json contains a 308 redirect from /weekly-dashboard/ (trailing slash) to /', () => {
    const content = JSON.parse(fs.readFileSync(serveJsonPath, 'utf-8'))
    const redirects: Array<{ source: string; destination: string; type: number }> =
      content.redirects ?? []
    const match = redirects.find(
      (r) => r.source === '/weekly-dashboard/' && r.destination === '/' && r.type === 308
    )
    expect(match).toBeDefined()
  })
})