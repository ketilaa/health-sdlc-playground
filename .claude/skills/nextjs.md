# Skill: Next.js + Jest + React Testing Library

Apply these conventions when the tech stack is Next.js.

## next.config.js

The app is deployed to GitHub Pages as a static export. Always include this in `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
}
module.exports = nextConfig
```

Without `output: 'export'`, `npm run build` does not produce an `out/` directory and the deploy workflow fails.

## Jest configuration

- The correct Jest config key to run a setup file after the test framework is installed is **`setupFilesAfterEnv`** — `setupFilesAfterEach` does not exist
- Prefer importing `@testing-library/jest-dom` directly in each test file (`import '@testing-library/jest-dom'`) rather than relying on a jest config setup file — more portable and avoids config lookup issues
- Use `jest.config.js` (CommonJS `module.exports = {}`) unless the project already uses ESM
- When using `next/jest`: `module.exports = createJestConfig(customConfig)` — do not `await` it in a synchronous config file
- Do not add `transform` overrides — `next/jest` already handles TypeScript and JSX

## Test file placement

- Place test files alongside their source files: `Component.test.tsx` next to `Component.tsx`
- Follow the existing codebase pattern if it differs

## E2E testing (Cucumber + Playwright)

Apply this section when writing `run-e2e.sh` and Cucumber step definitions.

**run-e2e.sh template:**
```bash
#!/usr/bin/env bash
set -e
SERVER_PID=""
cleanup() { [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null || true; }
trap cleanup EXIT

cd frontend && npm install && npm run build && cd ..
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
npx serve frontend/out -p 3000 --no-clipboard &
SERVER_PID=$!

for i in $(seq 1 20); do
  curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ | grep -qE "^[2345]" && break
  sleep 2
done

cd e2e && npm install
npx playwright install chromium --with-deps 2>/dev/null || npx playwright install chromium
./node_modules/.bin/cucumber-js \
  --require-module ts-node/register \
  --require '<feature-name>/**/*.steps.ts' \
  '../features/<feature-name>/**/*.feature' \
  --format progress
```

Key rules:
- The app is a **static export** — use `npx serve frontend/out` not `next start` (`next start` fails with `output: 'export'`)
- Kill port 3000 before starting: `lsof -ti:3000 | xargs kill -9 2>/dev/null || true`
- Feature files live in `features/<feature-name>/` at the repo root — reference them as `'../features/<feature-name>/**/*.feature'` from inside `e2e/`
- `ts-node`, `typescript`, and `@types/node` are already in `e2e/package.json` — do not re-declare them; read the existing `e2e/package.json` before adding any dependency
- `e2e/tsconfig.json` already sets `"lib": ["ES2020", "dom"]` — do not create a new one unless it is missing

## Component testing

- Use `@testing-library/react` with `render`, `screen`, and `userEvent`
- Query by role or `data-testid` — never by CSS class or internal implementation detail
- Wrap state-updating interactions in `act()` or use `userEvent` which handles this automatically
