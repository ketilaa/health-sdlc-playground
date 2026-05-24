import { resolveRoute } from './routes';

describe('resolveRoute (mirrors Next.js routing contract)', () => {
  it('returns HTTP 200 for GET "/"', () => {
    expect(resolveRoute('/').status).toBe(200);
  });

  it('returns HTTP 404 for an unknown path', () => {
    expect(resolveRoute('/this-route-does-not-exist').status).toBe(404);
  });

  it('returns 404 for other arbitrary unknown paths', () => {
    expect(resolveRoute('/foo/bar').status).toBe(404);
  });
});