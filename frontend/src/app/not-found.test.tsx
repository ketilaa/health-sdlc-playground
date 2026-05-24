import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import NotFound from './not-found';

describe('NotFound', () => {
  it('renders the 404 heading', () => {
    render(<NotFound />);
    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
  });

  it('renders the sub-message', () => {
    render(<NotFound />);
    expect(
      screen.getByRole('heading', { name: /couldn't find that page/i })
    ).toBeInTheDocument();
  });

  it('renders a "Back to home" link', () => {
    render(<NotFound />);
    const link = screen.getByRole('link', { name: /back to home/i });
    expect(link).toHaveAttribute('href', '/');
  });
});