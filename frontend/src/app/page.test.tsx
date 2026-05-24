import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import HomePage from './page';

describe('HomePage', () => {
  it('renders the welcome heading', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { name: /welcome to health playground/i })
    ).toBeInTheDocument();
  });

  it('renders the welcome body copy', () => {
    render(<HomePage />);
    expect(
      screen.getByText(/a space to explore health datasets/i)
    ).toBeInTheDocument();
  });
});