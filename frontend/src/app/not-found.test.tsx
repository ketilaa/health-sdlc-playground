import * as React from 'react';
import { render, screen } from '@testing-library/react';
import NotFoundPage from './not-found';

describe('NotFoundPage', () => {
  it('renders the "Page not found." heading as an h1', () => {
    render(<NotFoundPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /page not found/i }),
    ).toBeInTheDocument();
  });

  it('renders a "Go to home" link/button pointing to /', () => {
    render(<NotFoundPage />);
    const link = screen.getByRole('link', { name: /go to home/i });
    expect(link).toHaveAttribute('href', '/');
  });
});