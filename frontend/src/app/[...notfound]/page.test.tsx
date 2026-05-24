import CatchAllNotFound from './page';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe('Catch-all not-found route', () => {
  it('invokes Next.js notFound() so the framework returns HTTP 404', () => {
    const { notFound } = require('next/navigation');
    expect(() => CatchAllNotFound()).toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });
});