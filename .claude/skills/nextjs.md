# Skill: Next.js + Jest + React Testing Library

Apply these conventions when the tech stack is Next.js.

## Jest configuration

- The correct Jest config key to run a setup file after the test framework is installed is **`setupFilesAfterEnv`** — `setupFilesAfterEach` does not exist
- Prefer importing `@testing-library/jest-dom` directly in each test file (`import '@testing-library/jest-dom'`) rather than relying on a jest config setup file — more portable and avoids config lookup issues
- Use `jest.config.js` (CommonJS `module.exports = {}`) unless the project already uses ESM
- When using `next/jest`: `module.exports = createJestConfig(customConfig)` — do not `await` it in a synchronous config file
- Do not add `transform` overrides — `next/jest` already handles TypeScript and JSX

## Test file placement

- Place test files alongside their source files: `Component.test.tsx` next to `Component.tsx`
- Follow the existing codebase pattern if it differs

## Component testing

- Use `@testing-library/react` with `render`, `screen`, and `userEvent`
- Query by role or `data-testid` — never by CSS class or internal implementation detail
- Wrap state-updating interactions in `act()` or use `userEvent` which handles this automatically
