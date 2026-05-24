/**
 * Pure routing logic mirroring the Next.js App Router's behaviour for
 * the scaffolded routes. Used in tests to verify HTTP status mapping
 * for the Gherkin scenarios:
 *   - GET "/"  -> 200
 *   - GET unknown -> 404
 *
 * The actual HTTP responses are produced by Next.js at runtime; this
 * module encodes the same contract for fast, deterministic unit tests.
 */

export type RouteResult = { status: number };

const KNOWN_ROUTES = new Set<string>(['/']);

export function resolveRoute(path: string): RouteResult {
  // Normalise: strip query/hash and trailing slash (except root)
  const cleanPath = path.split('?')[0].split('#')[0];
  const normalised =
    cleanPath.length > 1 && cleanPath.endsWith('/')
      ? cleanPath.slice(0, -1)
      : cleanPath;

  if (KNOWN_ROUTES.has(normalised)) {
    return { status: 200 };
  }
  return { status: 404 };
}