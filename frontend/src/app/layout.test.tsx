import '@testing-library/jest-dom';
import { metadata } from './layout';

describe('Root layout metadata', () => {
  it('sets the document title to "Health Playground"', () => {
    expect(metadata.title).toBe('Health Playground');
  });
});