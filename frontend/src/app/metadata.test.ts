import { metadata } from './layout';

describe('Document metadata', () => {
  it('sets the document title to "Health Playground"', () => {
    expect(metadata.title).toBe('Health Playground');
  });
});