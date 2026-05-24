import * as React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from './page';

describe('HomePage', () => {
  it('renders the welcome heading as an h1', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /welcome to health playground/i }),
    ).toBeInTheDocument();
  });

  it('renders the supporting subtext', () => {
    render(<HomePage />);
    expect(screen.getByText(/an exploratory space for health data/i)).toBeInTheDocument();
  });
});